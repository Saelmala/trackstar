# Trackstar

[![CI](https://github.com/Saelmala/trackstar/actions/workflows/ci.yml/badge.svg)](https://github.com/Saelmala/trackstar/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

Trackstar is a self-hosted dashboard for runners. Log your workouts, plan
upcoming races, import activities from Strava, and keep all of it in a CouchDB
database you control. Built with Next.js, React and Tailwind CSS, and protected
by the OpenAuth Password service so only you can make changes.

> **Status:** Trackstar is a spare-time project, developed on `main`. It works,
> but it has no releases, no versioning guarantees and no automated tests yet.
> Treat it as a starting point to build on rather than a finished product.

## Tech stack

- **Next.js App Router** (server components + server actions)
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **CouchDB** as the backing data store
- **OpenAuth Password** service for authentication
- **Strava API** for importing activities (optional)

## Quick start

You need Node.js 22 or later.

```bash
git clone https://github.com/Saelmala/trackstar.git
cd trackstar
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000/login.

**Trackstar runs without any configuration.** With no CouchDB variables set, it
starts in demo mode: the dashboard shows sample data and the forms are disabled,
so you can look around before wiring anything up. Fill in the environment
variables below to switch it to your own database.

## Configuration

Copy `.env.local.example` to `.env.local` and fill in the values. `.env.local`
is gitignored — never commit it.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `COUCHDB_URL` | for live data | Base URL of your CouchDB instance |
| `COUCHDB_DB` | for live data | Database name (e.g. `trackstar`) |
| `COUCHDB_USERNAME` | for live data | CouchDB user |
| `COUCHDB_PASSWORD` | for live data | Password for that user |
| `OPENAUTH_PASSWORD_URL` | for login | OpenAuth Password login endpoint |
| `OPENAUTH_APP_ID` | for login | OpenAuth application ID |
| `OPENAUTH_APP_SECRET` | for login | OpenAuth application secret |
| `SESSION_SECRET` | for login | Long random string used to sign the session cookie |
| `STRAVA_CLIENT_ID` | for Strava | From your Strava API application |
| `STRAVA_CLIENT_SECRET` | for Strava | From your Strava API application |
| `STRAVA_REDIRECT_URI` | for Strava | `http://localhost:3000/api/strava/callback` in development |

> **Note:** If a value contains a `#`, wrap it in quotes so dotenv does not treat
> everything after the `#` as a comment.

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Setting up CouchDB

Any CouchDB instance works — Docker, a managed host, or a provider such as
[Eyevinn Open Source Cloud](https://www.osaas.io). Create a database, point
`COUCHDB_URL` and `COUCHDB_DB` at it, and give Trackstar a user that can read and
write it. Prefer a dedicated user over the admin account.

On first run Trackstar creates the Mango indexes it needs for the sorted run and
race queries. The configured user must have permission to create indexes.

### Authentication

Provide your OpenAuth Password endpoint and app credentials. A successful sign-in
sets a session cookie signed with `SESSION_SECRET`, and is required before any
CouchDB write. "Log out" clears the cookie and returns you to `/login`.

### Strava import (optional)

Create an application in the [Strava API settings](https://www.strava.com/settings/api)
to get a client ID and secret, and set the authorization callback domain to match
your `STRAVA_REDIRECT_URI`. Leave the Strava variables empty to hide the feature.

## Data model

| Document | Required fields | Notes |
| -------- | --------------- | ----- |
| `run` | `date`, `route`, `distanceKm`, `durationMinutes` | Optional metadata such as `terrain`, `effort`, `weather`, `notes`. |
| `race` | `name`, `city`, `raceDate`, `distanceKm` | Optional `goalTime`, `website`, `notes`. |

Documents get deterministic `_id` prefixes (`run:` / `race:`) and a `type` field
so Mango queries can filter efficiently.

## Project layout

```
src/app/         Routes, layouts, and the Strava OAuth callback
src/components/  React components (forms, lists, stats)
src/lib/         CouchDB access, auth, session handling, Strava client
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

## Ideas for extending it

- Weekly and monthly summary views built on the existing Mango queries.
- REST endpoints or scheduled jobs that read CouchDB for training reports.
- Notifications when a new race or run document is created.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set
up, what the checks are, and how to open a pull request. Participation is
governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately rather than in a public issue — see
[SECURITY.md](SECURITY.md).

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

Copyright 2026 Sandra Larsson.

## Acknowledgements

Activity import is powered by Strava. Use of the Strava API is subject to the
[Strava API Agreement](https://www.strava.com/legal/api). Trackstar is not
affiliated with or endorsed by Strava.
