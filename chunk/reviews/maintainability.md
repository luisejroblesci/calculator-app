# Maintainability review

Review the diff for code quality in this small vanilla JS app.

Check in particular:
- New code matches the existing style: plain functions, module-level state, the `actions` lookup table for button dispatch.
- Duplicated logic that should share a helper (e.g. term formatting in `render` and `equals`, state reset in `clearAll` and `equals`).
- New operations (multiply, divide, etc.) fit the `{ op, value }` term model, or the diff explains why the model changes.
- Comments explain why, not what, and stay accurate after the change.
- No unrelated refactors, dead code, or new dependencies.

Prefer few, high-value findings over a long list of nits.
