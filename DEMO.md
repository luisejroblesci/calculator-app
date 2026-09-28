# Demo: delegate the grunt work to an agent

**Use case:** *"I just need the agent to fix the merge conflicts / refactor a
file without spinning up a whole session for it."*

**What we're proving:** `chunk sidecar exec` runs a one-shot task in a clean
cloud sandbox — sync, run, done — with no local session, no chat UI, no
context switching, and the result can be pulled straight back.

**Benefit to the user:** mechanical tasks (refactors, dependency upgrades,
merge-conflict fixes) get handed off in a single command instead of a full
interactive agent session with local environment setup.

## What we actually ran

The task: extract the magic number `15` in `inputDigit()`'s digit-limit check
into a named `MAX_DIGITS` constant in `script.js` — a small, well-scoped,
mechanical refactor.

```bash
# Sync the working tree (including refactor-task.js) to the sidecar
chunk sidecar sync

# Run the one-shot task in the clean sidecar
chunk sidecar exec --command sh -- -c "cd /home/user/calculator-app && node refactor-task.js"

# Pull the result back
chunk sidecar exec --command cat --args /home/user/calculator-app/script.js > script.js
```

Real diff produced, entirely on the sidecar:

```diff
 let showingResult = false;
+const MAX_DIGITS = 15;

-  if (current.replace(/[-.]/g, "").length >= 15) return;
+  if (current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
```

## What we actually measured

| Step | Result | Wall-clock |
|---|---|---|
| `chunk sidecar exec` running the one-shot task (idempotent, repeated) | ✓ | **~0.6–0.7s** each run |

That's the cost of the mechanism itself (SSH exec into an already-warm
sidecar) — essentially free compared to spinning up a local agent session.

## The honest gap: this is a stand-in for a real agent, not a real agent

**`refactor-task.js` is a small deterministic Node script, not an AI coding
agent.** We used it instead of an actual agent CLI (e.g. `claude -p "..."`)
for one concrete reason: running a real agent inside the sidecar requires
forwarding a provider credential (`ANTHROPIC_API_KEY` or an equivalent OAuth
token) to a CircleCI-hosted microVM, and this demo run intentionally did not
push any real account credentials to third-party cloud infrastructure to
produce a marketing artifact.

What *is* validated:
- `chunk sidecar exec` can run an arbitrary one-shot command (`node
  refactor-task.js`, or equally `claude -p "refactor script.js to extract
  magic numbers"` if the sidecar had credentials) in a clean, already-synced
  environment.
- The result can be synced back with `chunk sidecar exec --command cat
  --args <path>` (this worked reliably; `chunk sidecar ssh -- cat ...`, the
  form shown in `chunk-cli/docs/GETTING_STARTED.md`'s lock-file example,
  errored with "invalid argument" in this run and needs a docs/CLI fix or a
  corrected example).

What's *not* validated end-to-end: an actual agent CLI reading a natural-language
instruction and producing this refactor unattended. To do that for real:

```bash
chunk validate --remote --env ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY  # or similar for sidecar exec
chunk sidecar exec --command claude --args '-p "refactor script.js to extract the magic number 15 into a MAX_DIGITS constant"'
```

(Requires the agent CLI to be installed on the sidecar image and a real
provider credential forwarded via `-e`/`--env-file`/`.env.local`, per the
"Environment variables" section of `chunk-cli/docs/GETTING_STARTED.md`.)

## Feasibility verdict

**Mechanism validated; full agent-in-the-loop not validated in this run.**
`chunk sidecar exec` for one-shot, non-interactive task execution works and
is fast. Whether a *real* agent CLI, given credentials, reliably produces a
correct refactor from a natural-language prompt is a separate question this
demo does not answer — that's model/agent behavior, not something Chunk
controls, but it's the part of the pitch that actually needs a live
credentialed run to back up.
