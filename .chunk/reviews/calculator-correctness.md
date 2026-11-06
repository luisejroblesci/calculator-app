# Calculator logic correctness

This project is a dependency-free browser calculator. All logic is in `script.js`. This reviewer looks for behavioral bugs in the input state machine and arithmetic.

## Repository rules

- State is the module-level `tokens`, `current`, `entered` and `showingResult`. `tokens` alternates number strings and operators (`+ - * /`). `current` is the number being typed. `entered` records whether `current` was typed since the last operator. `showingResult` marks a finished result. Every action must leave these four consistent with each other.
- `evaluate(list)` implements precedence: `*` and `/` bind tighter than `+` and `-`. Changes must preserve that.
- Numbers are normalized through `formatNumber` (`toPrecision(12)`) to hide floating-point noise. Results that are not finite become `"Error"`.
- The `"Error"` state is handled in `isError()` and in `press()`: any action other than clear or backspace resets first. New actions must respect this.
- `MAX_DIGITS` limits the digits typed. Digits, decimal, negate, percent, backspace and operator-replacement have special cases, for example `"-0"`, a lone `"-"` and a trailing operator.
- The keyboard path (`KEY_ACTIONS`, the keydown handler) and the click path (`actions`, the click handler) must behave identically for the same operation.

## Severity

- **high**: A concrete input sequence gives a wrong numeric result, crashes, leaves the display as `NaN` or `undefined`, or corrupts state so later input is wrong. Give the exact key sequence, the expected display and the actual display.
- **medium**: A reachable sequence gives a misleading expression line, or the keyboard and click paths disagree. It must be tied to a specific sequence and to the requested change.
- **low**: Edge cases the request does not ask for, unreachable states, cosmetic formatting, and extreme-magnitude formatting such as exponent notation, unless the request is about them.

## Instructions

- Review only the change, not code it does not touch, unless the change makes a problem newly reachable.
- The requested change is the scope. Behavior it does not ask for is not required.
- Trace the state variables by hand through the key sequences you suspect, and only report what you traced.
- Report all findings at once. Do not hold related ones back for a later round.
- Report no findings when nothing clears the bar.
