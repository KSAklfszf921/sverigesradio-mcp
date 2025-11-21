# Sveriges Radio MCP Server

> Modern MCP server för Sveriges Radios öppna API - tillgång till svenska radioprogram, podcasts, livestreams och nyheter.

[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Funktioner

**Ljudinnehåll** - Direktåtkomst till MP3-filer för streaming och nedladdning
**Metadata** - Detaljerad information om program, kanaler och avsnitt
**Live-data** - Realtidsinformation om vad som sänds just nu
**Trafikinfo** - Aktuella trafikmeddelanden med geografiska koordinater
**Sök** - Fulltextsök i program, avsnitt och innehåll

---

## Snabbstart

### Lokal Installation
```bash
npm install -g sverigesradio-mcp
sr-mcp
```

### HTTP Server med Auth
```bash
cp .env.example .env
echo "MCP_AUTH_TOKEN=your-secret-token" >> .env
npm run start:streamable
```

**Endpoints:**
- `POST/GET /mcp` - Modern StreamableHTTP endpoint (rekommenderas)
- `GET /sse` - Legacy SSE endpoint
- `GET /health` - Health check

**Auth:**
```bash
curl -H "Authorization: Bearer your-token" \
     -H "Accept: application/json, text/event-stream" \
     https://your-server.com/mcp
```

---

## Verktyg

**17 verktyg tillgängliga** - Här är ett urval grupperat efter användningsområde:

### Aktuellt
- Vad som sänds på alla kanaler just nu
- Aktuellt program på specifik kanal
- Vilken låt som spelas just nu
- Tablå för vald kanal

### Nyheter
- Senaste nyhetsutsändningar
- Översikt av alla nyhetsprogram

### Program & Avsnitt
- Sök efter program
- Hämta programinformation med ljudfiler
- Lista avsnitt från program

### Övrigt
- Hämta trafikrapporter för specifikt område
- Bläddra bland alla radiokanaler
- Sök bland allt innehåll

---

## Användningsexempel

**1. Live Radio Dashboard**
Kombinera flera verktyg för att få en komplett översikt av vad som händer just nu på Sveriges Radio.

**2. Smart Podcast-sökning**
Sök efter program och analysera metadata för att hitta relevanta podcasts baserat på intressen.

**3. Trafikanalys**
Hämta trafikrapporter för specifika geografiska områden och skapa realtidsvarningar för pendlingsstråk.

---

## Resources (4 st)

- `sr://api/info` - API-capabilities, versioner, rate limits
- `sr://channels/all` - Komplett kanallista med ID:n
- `sr://audio/quality-guide` - Ljudkvalitet och format
- `sr://categories/programs` - Alla 15 programkategorier

## Prompts (6 st)

- `find-podcast` - Hitta podcasts efter ämne
- `whats-on-now` - Vad som sänds just nu
- `traffic-nearby` - Trafikläget i ditt område
- `news-briefing` - Senaste nyheterna
- `explore-schedule` - Bläddra i tablån
- `whats-playing-now` - Aktuell låt på musikkanaler

---

## Development

```bash
npm run dev          # Development mode
npm run dev:http     # HTTP server development
npm run build        # Build production
npm test             # Run tests
```

---

## API Information

**Sveriges Radio Open API v2**
- Bas-URL: `https://api.sr.se/api/v2/`
- Format: JSON
- Auth: Ingen (publik API)
- Caching: HTTP ETags (304 Not Modified)

---

## License

MIT © Isak Skogstad

## Länkar

[SR API Documentation](https://api.sr.se/api/documentation/v2/) • [MCP Protocol](https://modelcontextprotocol.io) • [GitHub](https://github.com/KSAklfszf921/sverigesradio-mcp)
