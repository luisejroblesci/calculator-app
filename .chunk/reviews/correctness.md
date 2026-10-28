# Correctness review

This is a vanilla JS/HTML/CSS calculator (`script.js`, `index.html`). There is no test suite and no build step, so this review is the only check on the arithmetic and state-machine logic before it ships. Focus entirely on whether the calculator computes and displays the right thing.

## What to check

- State consistency across `terms` (array of `{ op, value }`), `pendingOp`, `current`, and `showingResult`. Trace sequences such as: pressing an operator immediately after `=`; pressing `=` with no terms or twice in a row; pressing an operator with no digits typed; clearing mid-expression.
- Floating-point handling: every value that reaches the display or `terms` should go through `formatNumber`. Check new arithmetic paths against cases like `0.1 + 0.2`, very large or very small magnitudes, and results that round to `-0`.
- Input limits: the 15-significant-digit cap in `inputDigit`, rejecting a second decimal point, leading-zero collapsing, and `backspace` behavior on a single digit or right after a result.
- Operator semantics: any new or changed operator (e.g. subtraction) must behave identically whether triggered by button click or the matching keyboard key, and the expression breadcrumb (`render`/`equals` text) must match what `equals` actually computes.
- The click handler's `actions` lookup and the `keydown` handler must both expose every action the diff adds or changes — an action reachable from one input method but not the other is a bug here, not a maintainability nit.

## Severity

- **High**: a concrete key/click sequence produces a result or displayed expression that is mathematically wrong, or leaves `current`/`terms`/`pendingOp` in a state where a later, ordinary sequence produces a wrong result (e.g. silent data loss, NaN, or a stuck display).
- **Medium**: a concrete sequence reaches dead code, throws, becomes unreachable from keyboard or click (but not both), or violates the 15-digit/decimal-point input limits in a way a user can trigger.
- **Low**: everything else — style of the fix, missed edge case that requires an extreme or contrived input, minor display wording.

Report only issues you can tie to a specific sequence of inputs and the wrong output or state it produces. Review only what the diff touches or makes newly reachable, not pre-existing behavior outside its scope.
