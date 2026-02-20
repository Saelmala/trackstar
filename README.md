## Trackstar

Trackstar is a Next.js + React + Tailwind CSS dashboard that helps runners log workouts, plan upcoming races, and store everything inside CouchDB running on Eyevinn Open Source Cloud (OSC).

### Tech stack

- **Next.js App Router** (server components + server actions)
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **OSC CouchDB** as the backing data store

## OSC CouchDB integration

The application reads/writes documents directly to the OSC-hosted CouchDB instance:

```
Instance URL: https://santenant-trackstar.apache-couchdb.auto.prod.osaas.io
Database: trackstar
Admin user: admin
Admin password: TrackstarAdmin#2024
```

Usage:

1. Copy the sample env file and keep or adjust the values.

   ```bash
   cp .env.local.example .env.local
   ```

2. Start the dev server with `npm run dev` and open `http://localhost:3000`.

- When the env vars are present, the "Log Run" and "Plan Race" forms write directly to OSC CouchDB and the dashboard shows live data.
- Without the env vars, the UI shows demo data and disables the forms so you know to hook up OSC.

## Data model

| Document | Required fields | Notes |
| -------- | --------------- | ----- |
| `run` | `date`, `route`, `distanceKm`, `durationMinutes` | Optional metadata such as `terrain`, `effort`, `weather`, `notes`. |
| `race` | `name`, `city`, `raceDate`, `distanceKm` | Optional `goalTime`, `website`, `notes`. |

Documents get deterministic `_id` prefixes (`run:` / `race:`) and a `type` field so Mango queries can filter efficiently.

## Development scripts

| Command | Description |
| ------- | ----------- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |

## Extending Trackstar

- Connect more OSC services (SmoothMQ, Encore, etc.) by calling their MCP tools or APIs from `src/lib/couchdb.ts`.
- Add REST endpoints or scheduled jobs that read CouchDB for weekly summaries.
- Wire up webhooks/notifications whenever a new race or run document is created.

Made with ❤️ on Eyevinn Open Source Cloud.
