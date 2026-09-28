#!/usr/bin/env bash
# Repeatable benchmark for the "delegate grunt work to an agent" demo (use case 3).
# Reapplies refactor-task.js on the sidecar N times (idempotent: it no-ops if
# MAX_DIGITS already exists) and records wall-clock time to
# results/<timestamp>.json.
#
# Requires: chunk CLI authenticated, an active sidecar, refactor-task.js
# synced (chunk sidecar sync).

set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$REPO_DIR/results"
mkdir -p "$RESULTS_DIR"

REPS="${1:-1}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$RESULTS_DIR/${TS}.json"

runs="[]"
for i in $(seq 1 "$REPS"); do
  echo "== Run $i/$REPS: one-shot task via chunk sidecar exec ==" >&2
  start=$(date +%s.%N)
  chunk sidecar exec --command sh -- -c "cd /home/user/calculator-app && node refactor-task.js" \
    > /tmp/chunk-exec-out.$$ 2>&1
  status=$?
  end=$(date +%s.%N)
  duration=$(echo "$end - $start" | bc)
  cat /tmp/chunk-exec-out.$$ >&2
  rm -f /tmp/chunk-exec-out.$$
  runs=$(echo "$runs" | python3 -c "
import json, sys
runs = json.load(sys.stdin)
runs.append({\"durationSec\": $duration, \"exitCode\": $status})
print(json.dumps(runs))
")
done

python3 -c "
import json
with open('$OUT', 'w') as f:
    json.dump({
        'timestamp': '$TS',
        'useCase': 'agent-task-delegation',
        'runs': json.loads('''$runs'''),
    }, f, indent=2)
"

echo "== Results written to $OUT ==" >&2
cat "$OUT"
