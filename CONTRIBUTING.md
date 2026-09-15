# Contributing to Trackstar

Thanks for taking an interest in Trackstar. Bug reports, ideas and pull requests
are all welcome.

By participating in this project you agree to abide by the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Getting set up

Trackstar needs Node.js 22 or later.

```bash
git clone https://github.com/Saelmala/trackstar.git
cd trackstar
npm install
cp .env.local.example .env.local
npm run dev
```

The app runs at http://localhost:3000. Without CouchDB environment variables it
starts in demo mode with sample data and the forms disabled, which is enough for
most UI work. See the [README](README.md) for what each variable does and how to
point it at a real CouchDB instance.

## Before you open a pull request

Run the same checks CI runs:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All four must pass. CI will run them again on your branch.

While working on a change, `npm run test:watch` reruns the affected tests as you
edit.

## Pull requests

- Branch off `main` and keep each pull request focused on one change.
- Describe what the change does and why. If it changes the UI, a screenshot helps.
- Update the README when you add or rename an environment variable.
- Commit messages loosely follow [Conventional Commits](https://www.conventionalcommits.org)
  (`feat:`, `fix:`, `docs:`, `ci:`). This is a convention, not a gate.

## Tests

Unit tests use [Vitest](https://vitest.dev) and live beside the code they cover
as `src/lib/*.test.ts`.

Please add tests for pure logic — parsing, validation, formatting, data mapping.
If a bug fix is testable, a test that fails before the fix is the best way to
describe it.

Keep testable logic out of modules marked `'use server'`: that directive limits a
module to async exports, so helpers there cannot be imported by a test. This is
why form parsing lives in `src/lib/parse.ts` rather than `src/lib/actions.ts`.

Modules that import `server-only` have no Node resolution outside the Next.js
bundler; `vitest.config.ts` aliases it to an empty stub so those modules can be
imported in tests.

## Code style

ESLint and TypeScript settle most questions — match the surrounding code for the
rest. A few conventions worth knowing:

- Server-only modules import `server-only` at the top. Keep secrets out of
  anything that can reach the client.
- Data access lives in `src/lib/`, React components in `src/components/`, and
  routes in `src/app/`.
- Mutations are Server Actions in `src/lib/actions.ts` rather than API routes,
  except where an external service needs a callback URL (see the Strava routes).

## Reporting bugs

Open an issue using the bug report template and include what you expected, what
happened, and how to reproduce it.

**Security problems are different** — please do not open a public issue. Follow
[SECURITY.md](SECURITY.md) instead.

## Never commit secrets

`.env.local` is gitignored and must stay that way. Keep real hostnames,
usernames, passwords and OAuth client secrets out of `.env.local.example`,
the README and test fixtures — use obvious placeholders instead.
