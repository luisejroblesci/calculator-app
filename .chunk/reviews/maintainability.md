# Maintainability and conventions review

This is a small, dependency-free vanilla JS app (`script.js`, plain functions, module-level state, no framework, no build tooling, no package.json). The existing style is deliberately minimal: a flat set of functions, an `actions` dispatch table mapping `data-action` to handlers, and state held in a handful of top-level `let` variables. Review the diff for fit with that style, not for abstract code quality.

## What to check

- New code should read like the surrounding code: plain top-level functions and state, the `actions` object for button dispatch, no classes, no new modules, no new runtime dependencies.
- Duplicated logic that the existing code already centralizes elsewhere should reuse it, not reimplement it — e.g. term formatting (`formatNumber`, the `${opSymbol(op)} ${value}` pattern) or state reset (`clearAll` vs. `equals`).
- A new operation should fit the existing `{ op, value }` term model used by `terms`, `commitTerm`, and `equals`'s reduce; if the diff changes that model, it should be because the new operation genuinely requires it, not for convenience.
- Comments should explain non-obvious *why* (like the existing floating-point comment in `formatNumber`), not restate the code, and must stay accurate after the change.
- No unrelated refactors, renamed variables, dead code, or speculative generalization (e.g. building a generic operator-precedence system for a calculator that only ever evaluates left-to-right).

## Severity

- **High**: the diff introduces a second, divergent implementation of logic that already exists elsewhere (e.g. a new place that formats numbers or resets state without going through the shared helper), creating a real risk the two drift apart.
- **Medium**: new code clearly breaks the established pattern in a way that will confuse the next change — e.g. a new action not wired through the `actions` table, state introduced outside the existing top-level variables, or a stale/misleading comment left after the change.
- **Low**: everything else — naming preferences, minor stylistic inconsistency, nits that don't risk a future bug or misunderstanding.

Review only the lines the diff touches or the patterns it establishes, not pre-existing code it leaves alone. Prefer reporting nothing over padding the list with low-value nits.
