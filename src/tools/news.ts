/**
 * News Tools - Sveriges Radio MCP Server
 * 2 tools for accessing news programs and episodes
 */

import { srClient } from '../lib/sr-client.js';
import type { PaginatedResponse, SRProgram, SREpisode } from '../types/sr-api.js';

// Tool handlers
export async function listNewsPrograms() {
  const response = await srClient.fetch<PaginatedResponse<SRProgram>>('news', {
    pagination: false,
  });

  return {
    programs: (response as any).programs || [],
  };
}

export async function getLatestNewsEpisodes() {
  const response = await srClient.fetch<PaginatedResponse<SREpisode>>('news/episodes');

  return {
    episodes: (response as any).episodes || [],
    pagination: response.pagination,
    timestamp: new Date().toISOString(),
  };
}

// Export tool definitions
export const newsTools = [
  {
    name: 'list_news_programs',
    description: 'Lista alla nyhetsprogram från Sveriges Radio (Ekot, Ekonomiekot, Kulturnytt, P4 Nyheter, etc.).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: listNewsPrograms,
  },
  {
    name: 'get_latest_news_episodes',
    description: 'Hämta senaste nyhetsavsnitt från alla nyhetsprogram (max 1 dag gamla). Perfekt för en snabb nyhetsöversikt!',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: getLatestNewsEpisodes,
  },
];
