#!/usr/bin/env bash
# Repeatable benchmark for the "run what you can't run locally" demo (use case 2).
# Runs chunk validate --remote (migrate + Postgres-backed integration test) N
# times and writes timing/pass-fail results to results/<timestamp>.json.
#
# Requires: chunk CLI authenticated, an active sidecar with Postgres already
# provisioned (see DEMO.md Checkpoint 1 / the "postgres" step in .chunk/config.json).

set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$REPO_DIR/results"
mkdir -p "$RESULTS_DIR"

REPS="${1:-1}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$RESULTS_DIR/${TS}.json"

runs="[]"
for i in $(seq 1 "$REPS"); do
  echo "== Run $i/$REPS: chunk validate --remote ==" >&2
  start=$(date +%s.%N)
  chunk validate --remote > /tmp/chunk-validate-out.$$ 2>&1
  status=$?
  end=$(date +%s.%N)
  duration=$(echo "$end - $start" | bc)
  cat /tmp/chunk-validate-out.$$ >&2
  rm -f /tmp/chunk-validate-out.$$
  runs=$(echo "$runs" | python3 -c "
import json, sys
runs = json.load(sys.stdin)
runs.append({\"durationSec\": $duration, \"exitCode\": $status, \"expected\": \"pass\"})
print(json.dumps(runs))
")
done

python3 -c "
import json
with open('$OUT', 'w') as f:
    json.dump({
        'timestamp': '$TS',
        'useCase': 'local-workload-offload',
        'runs': json.loads('''$runs'''),
    }, f, indent=2)
"

echo "== Results written to $OUT ==" >&2
cat "$OUT"
