# Agent instructions: replay the "stop broken agent code" demo

You are an AI coding agent. Follow these steps in order, exactly, and report the
result after each checkpoint. Do not skip the verification checkpoints — they are
what make this demo credible.

## Checkpoint 0 — preconditions

Run:

```bash
chunk auth status
chunk sidecar current
```

If `chunk auth status` does not show a valid CircleCI token, stop and report that
authentication is required before continuing. If no sidecar is active, run
`chunk sidecar setup` and wait for it to finish before proceeding.

## Checkpoint 1 — baseline validation (should pass)

```bash
chunk validate --remote
```

Report: pass/fail status of `lint` and `test`, and the total wall-clock time
printed at the end (e.g. `✓ 2/2 passed  8.0s`).

If this fails, stop — the repo is not in a valid starting state; do not proceed
to the next checkpoint.

## Checkpoint 2 — inject a broken change

Edit `calc.js` and change the `opSymbol` function to this deliberately-broken
version (both branches return `"+"`):

```js
function opSymbol(op) {
  return op === "-" ? "+" : "+";
}
```

Then run:

```bash
chunk validate --remote
```

Report: this must fail on the `test` step (an assertion on `opSymbol` inside
`script.test.js`), and must fail in under ~15 seconds. If it does not fail, or
if it fails on a different step, stop and report the discrepancy — do not
"fix forward" silently.

## Checkpoint 3 — fix and re-validate

Revert `calc.js` to the original (`opSymbol` returns `"−"` for `"-"`, `"+"`
for `"+"`). Run:

```bash
chunk validate --remote
```

Report: this must pass, `2/2 passed`, within a similar wall-clock time to
checkpoint 1.

## Checkpoint 4 — summarize

Report a short table: baseline time, broken-change time, fixed time, and state
plainly whether the sidecar caught the injected bug before any `git push` ran.
Do not push any commits as part of this demo — the point is that nothing reaches
the shared repo until validation passes locally against the sidecar.
