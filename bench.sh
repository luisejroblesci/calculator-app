#!/usr/bin/env bash
# Repeatable benchmark for the "stop broken agent code" demo (use case 1).
# Runs: baseline validate -> inject a bug -> validate (expect fail) -> revert -> validate (expect pass)
# and writes timing/pass-fail results to results/<timestamp>.json.
#
# Requires: chunk CLI authenticated, an active sidecar for this project
# (`chunk sidecar current`; run `chunk sidecar setup` once if none exists).

set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CALC_FILE="$REPO_DIR/calc.js"
RESULTS_DIR="$REPO_DIR/results"
mkdir -p "$RESULTS_DIR"

TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$RESULTS_DIR/${TS}.json"


run_validate() {
  local start end status
  start=$(date +%s.%N)
  chunk validate --remote > /tmp/chunk-validate-out.$$ 2>&1
  status=$?
  end=$(date +%s.%N)
  echo "$(echo "$end - $start" | bc)|$status"
  cat /tmp/chunk-validate-out.$$ >&2
  rm -f /tmp/chunk-validate-out.$$
}

echo "== Checkpoint 1: baseline validate (expect pass) ==" >&2
baseline_result=$(run_validate)
baseline_time="${baseline_result%%|*}"
baseline_status="${baseline_result##*|}"

echo "== Checkpoint 2: injecting bug into calc.js ==" >&2
cp "$CALC_FILE" "$CALC_FILE.bak"
sed -i.tmp 's/op === "-" ? "−" : "+";/op === "-" ? "+" : "+"; \/\/ BUG (injected by bench.sh)/' "$CALC_FILE"
rm -f "$CALC_FILE.tmp"

broken_result=$(run_validate)
broken_time="${broken_result%%|*}"
broken_status="${broken_result##*|}"

echo "== Checkpoint 3: reverting bug, re-validating (expect pass) ==" >&2
mv "$CALC_FILE.bak" "$CALC_FILE"

fixed_result=$(run_validate)
fixed_time="${fixed_result%%|*}"
fixed_status="${fixed_result##*|}"

cat > "$OUT" <<EOF
{
  "timestamp": "$TS",
  "useCase": "agent-code-validation",
  "baseline": { "durationSec": $baseline_time, "exitCode": $baseline_status, "expected": "pass" },
  "brokenChange": { "durationSec": $broken_time, "exitCode": $broken_status, "expected": "fail" },
  "afterFix": { "durationSec": $fixed_time, "exitCode": $fixed_status, "expected": "pass" }
}
EOF

echo "== Results written to $OUT ==" >&2
cat "$OUT"
