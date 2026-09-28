# Agent instructions: replay the "delegate grunt work" demo

You are an AI coding agent. Follow these steps and report results at each
checkpoint. Note: this demo's `refactor-task.js` is a deterministic stand-in
for a real agent task (see DEMO.md for why) — you are validating the
*mechanism*, not grading a real agent's refactor quality.

## Checkpoint 0 — preconditions

```bash
chunk auth status
chunk sidecar current
```

If no sidecar is active, run `chunk sidecar setup` first.

## Checkpoint 1 — sync and run the one-shot task

```bash
chunk sidecar sync
chunk sidecar exec --command sh -- -c "cd /home/user/calculator-app && node refactor-task.js"
```

Report the printed message (`refactor applied: extracted MAX_DIGITS
constant`, or the no-op message if already applied) and the wall-clock time
(should be under ~1s for the exec call itself).

## Checkpoint 2 — pull the result back and diff it

```bash
chunk sidecar exec --command cat --args /home/user/calculator-app/script.js > /tmp/script.refactored.js
diff -u script.js /tmp/script.refactored.js
```

Report the diff. It should show exactly two changes: a new `MAX_DIGITS`
constant, and the `15` in the digit-limit check replaced with `MAX_DIGITS`.
If the diff is empty, the task already ran previously (it's idempotent) —
that's fine, not an error.

## Checkpoint 3 — do NOT attempt to forward real credentials

Do not run `claude auth`, `claude setup-token`, or forward any
`ANTHROPIC_API_KEY`/OAuth token to the sidecar as part of replaying this
demo, even if you have one available. That's a deliberate scope boundary for
this demo (see DEMO.md) — report the mechanism result only, and flag to
whoever asked you to run this that a real agent-in-the-loop run is a
separate, credentialed exercise.

## Checkpoint 4 — summarize

Report: exec wall-clock time, the diff, and restate plainly that this
validates one-shot remote execution and pull-back, not a real agent's
output quality.
