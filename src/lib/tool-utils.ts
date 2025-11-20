/**
 * MCP helper utilities for validated tool execution and structured responses.
 */

import type { ZodTypeAny } from 'zod';
import { SRAPIError } from './errors.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  schema?: ZodTypeAny;
  handler: (args: any) => Promise<any>;
}

export function parseArgs(schema: ZodTypeAny | undefined, rawArgs: any) {
  if (!schema) {
    return rawArgs ?? {};
  }
  try {
    return schema.parse(rawArgs ?? {});
  } catch (error: any) {
    throw new SRAPIError('INVALID_PARAMS', 'Ogiltiga eller saknade argument', {
      issues: error?.issues ?? error?.message ?? 'Validation failed',
    });
  }
}

/**
 * Build MCP content with explicit JSON mime type so clients can parse reliably.
 */
export function asJsonContent(payload: unknown, summary?: string) {
  const content: Array<{ type: 'text'; text: string; mimeType?: string }> = [
    {
      type: 'text',
      mimeType: 'application/json',
      text: JSON.stringify(payload, null, 2),
    },
  ];

  if (summary) {
    content.unshift({
      type: 'text',
      text: summary,
    });
  }

  return content;
}

/**
 * Normalize errors to a serialisable payload for MCP responses.
 */
export function formatErrorPayload(error: any) {
  if (error instanceof SRAPIError) {
    return error.toJSON();
  }

  return {
    name: error?.name || 'Error',
    code: error?.code || 'UNKNOWN',
    message: error?.message || 'Okänt fel',
    details: error?.details,
  };
}
