import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { asJsonContent, parseArgs } from '../src/lib/tool-utils.ts';
import { SRAPIError } from '../src/lib/errors.ts';

describe('parseArgs', () => {
  test('returns parsed data when valid', () => {
    const schema = z.object({ id: z.number() });
    const result = parseArgs(schema, { id: 12 });
    expect(result).toEqual({ id: 12 });
  });

  test('throws SRAPIError on invalid input', () => {
    const schema = z.object({ id: z.number() });
    expect(() => parseArgs(schema, { id: 'abc' })).toThrow(SRAPIError);
  });
});

describe('asJsonContent', () => {
  test('produces MCP-friendly JSON payload', () => {
    const content = asJsonContent({ ok: true }, 'summary text');
    expect(content[0].text).toContain('summary text');
    expect(content[1].mimeType).toBe('application/json');
    expect(content[1].text).toContain('"ok": true');
  });
});
