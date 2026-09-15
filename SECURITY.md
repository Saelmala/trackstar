# Security Policy

## Supported versions

Trackstar is a small hobby project and is developed on `main`. Only the latest
commit on `main` receives security fixes.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Report vulnerabilities privately through
[GitHub Security Advisories](https://github.com/Saelmala/trackstar/security/advisories/new),
or by email to sandra.larsson@eyevinn.se.

Please include:

- a description of the issue and why you believe it is a security problem,
- the steps needed to reproduce it,
- the affected files or endpoints, if you know them.

You can expect an acknowledgement within 7 days. Because this is a spare-time
project, a fix may take longer — I will keep you updated on progress and let you
know when the issue is resolved.

## Scope

Trackstar is an application you self-host. There is no hosted service to attack,
so reports should concern the code in this repository: authentication and session
handling, the CouchDB access layer, and the Strava OAuth flow.

## Deploying safely

If you run your own instance, please note:

- `SESSION_SECRET` must be a long random value and must never be committed.
- The CouchDB credentials in `.env.local` grant full access to your database.
  Use a dedicated user rather than the admin account where possible.
- `STRAVA_CLIENT_SECRET` is a confidential OAuth credential. Rotate it in the
  Strava developer console if you suspect it has leaked.
- Never commit `.env.local`. It is listed in `.gitignore` for this reason.
