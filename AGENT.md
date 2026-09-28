# Agent instructions: replay the "run what you can't run locally" demo

You are an AI coding agent. Follow these steps in order and report the result
at each checkpoint.

## Checkpoint 0 — preconditions

```bash
chunk auth status
chunk sidecar current
```

If no sidecar is active, run `chunk sidecar setup` first and wait for it to
finish. Note: `chunk sidecar setup --force` / `chunk sidecar env` will
overwrite any manually-added steps in `.chunk/config.json`'s
`environment.setup` — if that happens, re-run the Postgres provisioning
command in Checkpoint 1 before continuing.

## Checkpoint 1 — provision Postgres on the sidecar (idempotent-ish; safe to
skip if you already know it's set up)

```bash
chunk sidecar exec --command sh -- -c \
  "sudo apt-get update -qq && sudo apt-get install -y postgresql && sudo service postgresql start && sudo -u postgres psql -c \"CREATE USER calc WITH PASSWORD 'calc';\" && sudo -u postgres psql -c \"CREATE DATABASE calculator OWNER calc;\""
```

If it reports the role/database already exists, that's fine — continue.

## Checkpoint 2 — run the gate

```bash
chunk validate --remote
```

Report: both `migrate` and `integration-test` must pass, and report the total
wall-clock time (e.g. `✓ 2/2 passed  9.1s`). If `integration-test` fails with
a connection error, Postgres on the sidecar is not running — go back to
Checkpoint 1.

## Checkpoint 3 — prove it's real, not mocked

Open `server/app.integration.test.js` and confirm out loud (in your report)
that it makes real HTTP requests to a real `http.createServer` instance and
issues real SQL through `pg` — there is no mock or in-memory stand-in for
Postgres. Then report: did this pass without any Postgres or Docker running
on the local machine you're operating from? (It should — you never started
either locally.)

## Checkpoint 4 — summarize

Report the wall-clock time from Checkpoint 2 and state plainly: no local
database or container runtime was required to get this result.
