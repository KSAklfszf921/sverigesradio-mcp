# Sveriges Radio MCP Server 🎙️

MCP server for Sveriges Radio's Open API - access Swedish radio programs, podcasts, live streams, schedules, news, and traffic information.

## Funktion

* Ljudfiler tillgängliga - Verktygen ger tillgång till MP3-filer för nedladdning och streaming
* Omfattande metadata - Program, kanaler, avsnitt har detaljerad information
* Live-data - Real-time information om vad som sänds just nu
* Trafikinformation - Aktuella trafikmeddelanden med geografisk data
* Sökmöjligheter - Fulltextsök i program, avsnitt och annat innehåll

* ## Tio exempel hur Sveriges Radio MCP-server kan användas för 

1. Skapa en personlig radio-dashboard
Kombinera flera verktyg för att bygga en komplett översikt:
* Vad som spelas JUST NU på alla kanaler
* Senaste nyheterna från Ekot
* Trafikläget i din stad
* Kommande program du följer

2. Analysera programtrender över tid
* Jämför antal avsnitt per månad för olika program
* Se vilka ämnen som är mest populära i olika kategorier
* Spåra hur ofta vissa nyckelord förekommer i programbeskrivningar
3. Bygg en smart podd-rekommendationsmotor
* Analysera programkategorier och beskrivningar
* Hitta liknande program baserat på innehåll
* Skapa spellistor med relaterade avsnitt
4. Trafikanalys och ruttplanering
* Hämta realtid trafikmeddelanden för specifika områden
* Kartlägg trafikstörningar geografiskt
* Skapa varningar för din pendlingssträcka
5. Musik-discovery från P2 och P3
* Följ spellistorna i realtid
* Bygg en historik över vilka låtar som spelats
* Hitta nya artister baserat på vad som spelas
6. Nyhetsbevakning och alert-system
* Övervaka Ekot för specifika nyckelord
* Få notiser när vissa ämnen nämns
* Jämför nyhetsrapportering mellan lokala P4-stationer
7. Program-arkeologi
* Sök igenom gamla avsnitt av klassiska program
* Hitta specifika intervjuer eller ämnen
* Bygg tidslinjer över hur ämnen utvecklats
8. Lokala nyhetsjämförelser
* Jämför vad olika P4-stationer rapporterar om
* Se vilka ämnen som är viktigast i olika län
* Analysera regional nyhetsrapportering
9. Skapa anpassade podcast-feeds
* Kombinera avsnitt från flera program
* Filtrera baserat på längd, datum eller ämne
* Bygg temainriktade spellistor (t.ex. "Vetenskap veckan")
10. Live stream-aggregator
* Bygg en egen radio-app med alla Sveriges Radio-kanaler
* Skapa en minimal radiospelare för terminalen


## Tillgänliga verktyg (Tools)

* get_all_rightnow - Översikt av vad som sänds på alla kanaler just nu
* list_channels - Listar alla radiokanaler (P1, P2, P3, P4-kanaler etc.)
* get_channel_rightnow - Vad som sänds just nu på P1
* search_programs - Sökte efter "Ekot"
* get_program - Hämtade detaljerad info om Ekot
* list_episodes - Listade avsnitt från Ekot
* get_latest_news_episodes - Senaste nyhetsutsändningar
* get_playlist_rightnow - Vilken låt som spelas 
* get_traffic_messages - Trafikmeddelanden från Stockholm
* search_all - Global sökning efter "klimat"
* list_program_categories - Programkategorier (Nyheter, Sport, etc.)
* get_recently_published - Senast publicerade program
* get_channel_schedule - Tablå för P3 idag
* search_episodes - Sökte efter avsnitt om AI
* get_episode - Hämtade specifikt Ekot-avsnitt med ljudfiler
* list_news_programs - Lista över alla nyhetsprogram


## Quick Start

### Remote (Recommended)
```bash
# Coming soon - Render deployment
# MCP endpoint: https://sr-mcp.onrender.com/sse
```

### Local Installation
```bash
npm install -g sverigesradio-mcp
sr-mcp
```

### From Source
```bash
git clone https://github.com/KSAklfszf921/sverigesradio-mcp.git
cd sverigesradio-mcp
npm install
npm run build
npm start
```

### HTTP Server with Authentication
```bash
# Copy environment template
cp .env.example .env

# Set your auth token (optional)
echo "MCP_AUTH_TOKEN=your-secret-token" >> .env

# Start HTTP server
npm run start:streamable
```

**Endpoints:**
- `GET /health` - Health check with server status (no auth required)
- `POST/GET/DELETE /mcp` - Modern MCP endpoint (StreamableHTTP)
  - `POST /mcp` - Send MCP requests (initialize, tools/list, etc.)
  - `GET /mcp` - Open SSE stream for real-time responses
  - `DELETE /mcp` - Close session explicitly
- `GET /sse` - Legacy SSE endpoint (backward compatibility)
- `POST /messages?sessionId=xxx` - Legacy message endpoint

**Authentication:**
If `MCP_AUTH_TOKEN` is set, include in requests:
```bash
# Modern endpoint
curl -H "Authorization: Bearer your-secret-token" \
     -H "Accept: application/json, text/event-stream" \
     https://your-server.com/mcp

# Legacy endpoint
curl -H "Authorization: Bearer your-secret-token" \
     https://your-server.com/sse
```

**Session Management:**
Modern endpoint uses `Mcp-Session-Id` header for stateful conversations:
```bash
# Initialize (server returns session ID in header)
curl -X POST https://your-server.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",...}'

# Subsequent requests (include session ID)
curl -X POST https://your-server.com/mcp \
  -H "Mcp-Session-Id: <session-id-from-above>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

**For Claude Web / Modern MCP Clients:**
The modern `/mcp` endpoint is designed for Claude on the web and other clients supporting the 2025-03-26 Streamable HTTP specification.

**For Lovable/AI Tools (Legacy):**
```javascript
// Configure MCP endpoint with Bearer token
{
  "url": "https://your-server.com/sse",
  "headers": {
    "Authorization": "Bearer your-secret-token"
  }
}
```



## 📚 Resources (4 total) ✅

Quick reference data available via `ReadResource`:

- **sr://api/info** - API capabilities, versioning, rate limits, defaults
- **sr://channels/all** - Complete channel list with IDs (P1-P4, all local stations)
- **sr://audio/quality-guide** - Audio quality levels, formats, recommendations
- **sr://categories/programs** - All 15 program categories with IDs

## 🎯 Prompts (6 total) ✅

Pre-built workflows via `GetPrompt`:

### 1. `find-podcast`
Find podcasts by topic (e.g., "historia", "true crime", "musik")
```
Arguments: topic (required), limit (optional)
```

### 2. `whats-on-now`
See what's broadcasting NOW on SR
```
Arguments: channel (optional - P1, P2, P3, P4)
```

### 3. `traffic-nearby`
Check traffic conditions in your area
```
Arguments: location (required), severity (optional 1-5)
```

### 4. `news-briefing`
Latest news summary from SR
```
Arguments: program (optional - "Ekot", "Ekonomiekot", etc.)
```

### 5. `explore-schedule`
Browse channel schedule (TV guide style)
```
Arguments: channel (required), date (optional YYYY-MM-DD)
```

### 6. `whats-playing-now` 🎵
Current song on a music channel
```
Arguments: channel (required - "P2", "P3", "SR Klassiskt")
```

## 🛠️ Development

```bash
# Development mode
npm run dev

# HTTP server
npm run dev:http

# Build
npm run build

# Test
npm test
```

## 📚 API Coverage

Based on Sveriges Radio's Open API v2:
- Base URL: `https://api.sr.se/api/v2/`
- Format: JSON
- Authentication: None (public API)
- Caching: Respects HTTP ETags (304 Not Modified)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📝 License

MIT © Isak Skogstad

## 🔗 Links

- [SR API Documentation](https://api.sr.se/api/documentation/v2/)
- [MCP Protocol](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/KSAklfszf921/sverigesradio-mcp)
