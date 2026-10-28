# Correctness review

Review the diff for logic bugs in the calculator (`script.js`).

Check in particular:
- State transitions between `terms`, `pendingOp`, `current`, and `showingResult` stay consistent (e.g. pressing an operator right after `=`, or `=` with no terms).
- Floating-point handling: results go through `formatNumber`; flag any arithmetic or display path that bypasses it (`0.1 + 0.2`, large and tiny values, negative zero).
- Input limits: the 15-digit cap, multiple decimal points, leading zeros, and backspace on single-digit or result values.
- Operator handling: `+` and `-` behave the same from the buttons and the keyboard, and the expression line matches the computed result.
- Keyboard and click handlers stay in sync (every action reachable from one is reachable from the other).

Report only issues you can tie to a concrete input sequence and a wrong output. Give the key presses that trigger it.
