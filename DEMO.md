# Demo: run what you can't run locally

**Use case:** *"I can't run the integration tests locally, I don't have the
services or my laptop can't handle it."*

**What we're proving:** a Chunk sidecar gives you a full backing service
(Postgres, in this case) in the cloud, so an integration test that genuinely
needs a live database can run without installing or starting anything locally.

**Benefit to the user:** you don't skip the check, and you don't wait in a CI
queue just to find out if your change works against a real service — you get
the same answer in seconds, from your own machine, even if that machine has no
Docker daemon running (true of the machine this demo was authored on).

## What was added

- `server/` — a minimal "calculation history" HTTP API (`POST /calculations`,
  `GET /calculations`) backed by Postgres via the `pg` driver.
- `docker-compose.yml` — for developers who *do* have Docker locally and want
  to run the integration test against a local Postgres.
- `server/app.integration.test.js` — a real integration test: it runs a
  migration, inserts a row over HTTP, reads it back, and asserts the result
  came from Postgres. It has no mocks; without a live database it fails.
- `.chunk/config.json` gained a `postgres` environment-setup step (installs
  and starts Postgres natively via `apt`, then creates the `calc` user/db) and
  two gate commands: `migrate` (role `setup`) and `integration-test` (role
  `gate`, runs `npm run test:integration`).

## Steps

```bash
# One-time: provision Postgres on the sidecar (see note below on why this
# step needs to be run manually right now)
chunk sidecar exec --command sh -- -c \
  "sudo apt-get update -qq && sudo apt-get install -y postgresql && sudo service postgresql start && sudo -u postgres psql -c \"CREATE USER calc WITH PASSWORD 'calc';\" && sudo -u postgres psql -c \"CREATE DATABASE calculator OWNER calc;\""

# Sync + run the gate (migrate, then the integration test) entirely on the sidecar
chunk validate --remote
```

No local Postgres, no local Docker, no `docker compose up` required — the
sidecar has its own database.

## What we actually measured

Real run against the sidecar for this repo:

| Step | Result | Wall-clock |
|---|---|---|
| `chunk validate --remote` (migrate + integration test, Postgres already provisioned) | ✓ 2/2 passed | **9.1s** |

The integration test itself (migration + HTTP round-trip through a real
Postgres row) ran in ~125ms once inside the sidecar — the wall-clock time is
almost entirely sync + process startup, not the database work.

## A real limitation we hit

`chunk sidecar setup --force` (and `chunk sidecar env`) **auto-detects** the
tech stack and regenerates `environment.setup` — it overwrote our manually
added `postgres` step the first time we ran it after adding it. We had to
provision Postgres by hand via `chunk sidecar exec` (shown above) and then
re-add the `postgres` step to `.chunk/config.json` afterwards, purely for
documentation. **Today, a custom backing-service setup step does not survive
a re-run of environment auto-detection** — this is worth flagging as a product
gap, not something to paper over in the pitch.

## Feasibility verdict

**Validated, with a caveat.** The core claim holds: a sidecar can run an
integration test against a real Postgres instance that doesn't exist locally,
in single-digit seconds. But provisioning a non-trivial backing service isn't
a first-class, durable part of `chunk sidecar setup` yet — it currently
requires a manual one-time `sidecar exec` step outside the normal setup flow,
and that step doesn't survive `--force` re-detection.
