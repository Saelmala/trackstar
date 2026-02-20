## Trackstar

Trackstar is a Next.js + React + Tailwind CSS dashboard that helps runners log workouts, plan upcoming races, and store everything securely in CouchDB. Access to the dashboard is protected with the OpenAuth Password service so only authenticated users can make changes.

### Tech stack

- **Next.js App Router** (server components + server actions)
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **CouchDB** as the backing data store (sample connection runs on Eyevinn OSC)
- **OpenAuth Password** service for authentication

## Environment setup

1. Copy the sample env file and adjust the values to match your OSC/OpenAuth projects.

   ```bash
   cp .env.local.example .env.local
   ```

   > **Important:** If your password contains a `#` (like `TrackstarAdmin#2024`), wrap it in quotes so
   > dotenv does not treat everything after `#` as a comment.

2. Start the dev server with `npm run dev` and open `http://localhost:3000/login`.
3. Sign in with your OpenAuth credentials to unlock the dashboard.

- When the CouchDB env vars are present, the "Log Run" and "Plan Race" forms write directly to CouchDB and the dashboard shows live data.
- Without the CouchDB env vars, the UI shows demo data and disables the forms so you know to hook it up.
- On first run, Trackstar automatically creates the Mango indexes it needs for the sorted run/race queries (requires the admin credentials from the sample env file).

### Required env vars

```
COUCHDB_URL=
COUCHDB_DB=
COUCHDB_USERNAME=
COUCHDB_PASSWORD=
OPENAUTH_PASSWORD_URL=
OPENAUTH_APP_ID=
OPENAUTH_APP_SECRET=
SESSION_SECRET="replace-with-a-long-random-string"
```

### Sample OSC CouchDB instance

If you are using the shared OSC instance, these are the connection values:

```
Instance URL: https://santenant-trackstar.apache-couchdb.auto.prod.osaas.io
Database: trackstar
Admin user: admin
Admin password: TrackstarAdmin#2024
```

### Authentication (OpenAuth Password)

Provide your OpenAuth Password endpoint + app credentials in `.env.local`. Successful sign-in sets a signed session cookie (using `SESSION_SECRET`) and is required before any CouchDB writes can happen. Clicking "Log out" clears the cookie and returns you to `/login`.

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
