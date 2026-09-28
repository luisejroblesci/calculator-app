# Demo: Stop broken agent code from flooding CI

**Use case:** *"My agent keeps pushing broken code and CI is full of noise."*

**What we're proving:** a `chunk` sidecar can run this repo's lint + test gate in a
CI-matched cloud environment in **single-digit seconds**, before anything is pushed —
so a broken change never reaches the shared CircleCI pipeline.

**Benefit to the user:** the developer (or their AI agent) gets pass/fail feedback
fast enough to fix-and-retry in a loop, without waiting in a CI queue and without
adding noise to a pipeline other developers share.

## Prerequisites

- `chunk` CLI installed and authenticated (`chunk auth status` shows a valid
  CircleCI token).
- An active sidecar for this project: `chunk sidecar current`. If none exists,
  run `chunk sidecar setup` once (detects the Node stack, creates a sidecar, and
  installs dependencies).

## Steps

```bash
# 0. Confirm the sidecar is set up and active
chunk sidecar current

# 1. Sync + validate the clean repo — this is the "everything is fine" baseline
chunk validate --remote
```

Now simulate an AI agent pushing a broken change — flip one branch of `opSymbol`
in `calc.js` so both operators render as `+`:

```js
// calc.js
function opSymbol(op) {
  return op === "-" ? "+" : "+"; // bug
}
```

```bash
# 2. Validate again — this should fail fast, before any push
chunk validate --remote
```

Fix it (revert the change), then:

```bash
# 3. Validate once more — now it passes
chunk validate --remote
```

## What we actually measured

Real timings captured running this exact sequence against the sidecar for this
repo (`decae58f-f42d-4db4-8a1e-6a4bdc6e085e`, network round-trip to CircleCI's
cloud included):

| Step | Result | Wall-clock |
|---|---|---|
| First sync + validate (clean) | ✓ 2/2 passed | **17.1s** |
| Validate after injecting the bug | ✗ 1/2 passed (test step) | **7.2s** — failed on the `test` gate, `opSymbol` assertion, before touching CI |
| Validate after fixing it | ✓ 2/2 passed | **8.0s** |

A full CircleCI pipeline run for this same job (queue + container boot + checkout +
`npm install` + lint + test) takes low-single-digit *minutes*, not seconds — the
sidecar reuses an already-provisioned environment and only re-syncs the diff, so
each loop iteration costs single-digit seconds instead of a full pipeline cycle.

## Feasibility verdict

**Validated.** `chunk validate --remote` against an existing sidecar catches a
real, deliberately-broken unit test in ~7 seconds, using nothing beyond what's
already documented in `chunk-cli/docs/GETTING_STARTED.md` ("Sidecar workflow")
and the `commands` schema in `.chunk/config.json`. No new chunk-cli functionality
was needed — only adding an actual test/lint suite to this repo (it previously
had zero tests to validate).
