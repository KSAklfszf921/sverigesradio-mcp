/**
 * Program Tools - Sveriges Radio MCP Server
 * 4 tools for searching and accessing radio programs
 */

import { z } from 'zod';
import { srClient } from '../lib/sr-client.js';
import type { PaginatedResponse, SRProgram, SRProgramCategory } from '../types/sr-api.js';

// Schemas
const SearchProgramsSchema = z.object({
  query: z.string().optional().describe('Textsökning i programnamn'),
  programCategoryId: z.number().optional().describe('Filtrera på kategori-ID'),
  channelId: z.number().optional().describe('Filtrera på kanal'),
  hasOnDemand: z.boolean().optional().describe('Endast program med podd'),
  isArchived: z.boolean().optional().describe('Visa arkiverade program'),
  filter: z.string().optional().describe('Filterfält (t.ex. "program.name")'),
  filterValue: z.string().optional().describe('Filtervärde'),
  sort: z.string().optional().describe('Sortering (t.ex. "name", "name+desc")'),
  page: z.number().min(1).optional(),
  size: z.number().min(1).max(100).optional(),
});

const GetProgramSchema = z.object({
  programId: z.number().describe('Program-ID'),
});

const GetProgramScheduleSchema = z.object({
  programId: z.number().describe('Program-ID'),
  fromDate: z.string().optional().describe('Från datum (YYYY-MM-DD)'),
  toDate: z.string().optional().describe('Till datum (YYYY-MM-DD)'),
  page: z.number().min(1).optional(),
  size: z.number().min(1).max(100).optional(),
});

// Tool handlers
export async function searchPrograms(params: z.infer<typeof SearchProgramsSchema>) {
  const queryParams: any = { ...params };

  const response = await srClient.fetch<PaginatedResponse<SRProgram>>('programs', queryParams);

  return {
    programs: (response as any).programs || [],
    pagination: response.pagination,
  };
}

export async function getProgram(params: z.infer<typeof GetProgramSchema>) {
  const { programId } = params;

  const response = await srClient.fetch<any>(`programs/${programId}`);

  return {
    program: response.program || response,
  };
}

export async function listProgramCategories() {
  const response = await srClient.fetch<PaginatedResponse<SRProgramCategory>>('programcategories', {
    pagination: false,
  });

  return {
    categories: (response as any).programcategories || [],
  };
}

export async function getProgramSchedule(params: z.infer<typeof GetProgramScheduleSchema>) {
  const { programId, fromDate, toDate, page, size } = params;

  const queryParams: any = {
    programid: programId,
    page,
    size,
  };

  if (fromDate) queryParams.fromdate = fromDate;
  if (toDate) queryParams.todate = toDate;

  const response = await srClient.fetch<any>('scheduledepisodes', queryParams);

  return {
    schedule: (response as any).schedule || [],
    pagination: response.pagination,
  };
}

// Export tool definitions
export const programTools = [
  {
    name: 'search_programs',
    description: 'Sök efter radioprogram i Sveriges Radio (t.ex. Ekot, P3 Dokumentär, Sommar i P1). Kan filtrera på kategori, kanal, om det finns som podd, med mera.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Textsökning i programnamn',
        },
        programCategoryId: {
          type: 'number',
          description: 'Filtrera på kategori-ID (använd list_program_categories för att se alla)',
        },
        channelId: {
          type: 'number',
          description: 'Filtrera på kanal-ID',
        },
        hasOnDemand: {
          type: 'boolean',
          description: 'Endast program som finns som podd/on-demand',
        },
        isArchived: {
          type: 'boolean',
          description: 'Inkludera arkiverade program',
        },
        sort: {
          type: 'string',
          description: 'Sortering, t.ex. "name" eller "name+desc"',
        },
        page: {
          type: 'number',
          description: 'Sidnummer',
        },
        size: {
          type: 'number',
          description: 'Antal per sida (max 100)',
        },
      },
    },
    handler: searchPrograms,
  },
  {
    name: 'get_program',
    description: 'Hämta detaljerad information om ett specifikt radioprogram inklusive beskrivning, kanal, kontaktinfo och poddgrupper.',
    inputSchema: {
      type: 'object',
      properties: {
        programId: {
          type: 'number',
          description: 'Program-ID',
        },
      },
      required: ['programId'],
    },
    handler: getProgram,
  },
  {
    name: 'list_program_categories',
    description: 'Lista alla programkategorier i Sveriges Radio (t.ex. Nyheter, Musik, Sport, Kultur, Samhälle).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: listProgramCategories,
  },
  {
    name: 'get_program_schedule',
    description: 'Hämta tablå/schema för ett specifikt program - när det sänds och på vilka kanaler.',
    inputSchema: {
      type: 'object',
      properties: {
        programId: {
          type: 'number',
          description: 'Program-ID',
        },
        fromDate: {
          type: 'string',
          description: 'Från datum (YYYY-MM-DD)',
        },
        toDate: {
          type: 'string',
          description: 'Till datum (YYYY-MM-DD)',
        },
        page: {
          type: 'number',
          description: 'Sidnummer',
        },
        size: {
          type: 'number',
          description: 'Antal per sida',
        },
      },
      required: ['programId'],
    },
    handler: getProgramSchedule,
  },
];
