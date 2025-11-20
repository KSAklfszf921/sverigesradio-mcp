/**
 * Tool Registry - All 26 SR MCP Tools
 */

import { channelTools } from './channels.js';
import { programTools } from './programs.js';
import { episodeTools } from './episodes.js';
import { scheduleTools } from './schedule.js';
import { playlistTools } from './playlists.js';
import { newsTools } from './news.js';
import { trafficTools } from './traffic.js';
import { miscTools } from './misc.js';

// Export all tools (26 total)
export const allTools = [
  ...channelTools,      // 2 tools
  ...programTools,      // 4 tools
  ...episodeTools,      // 5 tools
  ...scheduleTools,     // 3 tools
  ...playlistTools,     // 3 tools ⭐ NEW
  ...newsTools,         // 2 tools
  ...trafficTools,      // 2 tools
  ...miscTools,         // 5 tools (toplists, extra, groups, search)
];

// Export individual handlers
export * from './channels.js';
export * from './programs.js';
export * from './episodes.js';
export * from './schedule.js';
export * from './playlists.js';
export * from './news.js';
export * from './traffic.js';
export * from './misc.js';

// Tool count verification
console.assert(allTools.length === 26, `Expected 26 tools, got ${allTools.length}`);
