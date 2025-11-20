/**
 * Playlist Tools - Sveriges Radio MCP Server
 * 3 NEW tools for accessing music playlists (discovered from sverigesradio-api-js)
 */

import { z } from 'zod';
import { srClient } from '../lib/sr-client.js';
import type { SRPlaylist } from '../types/sr-api.js';

// Schemas
const GetPlaylistRightNowSchema = z.object({
  channelId: z.number().describe('Kanal-ID'),
});

const GetEpisodePlaylistSchema = z.object({
  episodeId: z.number().describe('Avsnitt-ID'),
});

const SearchPlaylistsSchema = z.object({
  query: z.string().optional().describe('Sök efter låt, artist, album'),
  channelId: z.number().optional().describe('Filtrera på kanal'),
  page: z.number().min(1).optional(),
  size: z.number().min(1).max(100).optional(),
});

// Tool handlers
export async function getPlaylistRightNow(params: z.infer<typeof GetPlaylistRightNowSchema>) {
  const { channelId } = params;

  const response = await srClient.fetch<SRPlaylist>('playlists/rightnow', {
    channelid: channelId,
  });

  return {
    currentSong: response.song,
    nextSong: response.nextsong,
    previousSong: response.previoussong,
    channel: response.channel,
    timestamp: new Date().toISOString(),
  };
}

export async function getEpisodePlaylist(params: z.infer<typeof GetEpisodePlaylistSchema>) {
  const { episodeId } = params;

  const response = await srClient.fetch<SRPlaylist>('playlists/getplaylistbyepisodeid', {
    id: episodeId,
  });

  return {
    playlist: response.playlist || [],
    episodeId,
  };
}

export async function searchPlaylists(params: z.infer<typeof SearchPlaylistsSchema>) {
  const { query, channelId, page, size } = params;

  const queryParams: any = { page, size };
  if (query) queryParams.query = query;
  if (channelId) queryParams.channelid = channelId;

  const response = await srClient.fetch<any>('playlists', queryParams);

  return {
    results: (response as any).playlists || (response as any).playlist || [],
    pagination: response.pagination,
  };
}

// Export tool definitions
export const playlistTools = [
  {
    name: 'get_playlist_rightnow',
    description: 'Visa vilken låt som spelas JUST NU på en kanal. Perfekt för att se vad som är på radion i realtid! Inkluderar artist, titel, album och skivbolag.',
    schema: GetPlaylistRightNowSchema,
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'number',
          description: 'Kanal-ID (t.ex. 163 för P2 musik)',
        },
      },
      required: ['channelId'],
    },
    handler: getPlaylistRightNow,
  },
  {
    name: 'get_episode_playlist',
    description: 'Hämta komplett spellista för ett avsnitt - alla låtar som spelades i avsnittet med tidsstämplar.',
    schema: GetEpisodePlaylistSchema,
    inputSchema: {
      type: 'object',
      properties: {
        episodeId: {
          type: 'number',
          description: 'Avsnitt-ID',
        },
      },
      required: ['episodeId'],
    },
    handler: getEpisodePlaylist,
  },
  {
    name: 'search_playlists',
    description: 'Sök i spellistor efter låtar, artister eller album från Sveriges Radio.',
    schema: SearchPlaylistsSchema,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Sök efter låt, artist, album, kompositör',
        },
        channelId: {
          type: 'number',
          description: 'Filtrera på kanal',
        },
        page: {
          type: 'number',
        },
        size: {
          type: 'number',
        },
      },
    },
    handler: searchPlaylists,
  },
];
