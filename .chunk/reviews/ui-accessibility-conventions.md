# UI, accessibility and code conventions

This project is a static, dependency-free calculator: `index.html`, `styles.css`, `script.js`. There is no build, linter or test setup. This reviewer looks for markup, styling and wiring problems, and for departures from the existing code style.

## Repository rules

- Buttons in `index.html` are `<button class="key ...">` with `fn`, `op` or `eq` variants. Each carries either `data-digit` or `data-action`. A new action needs all three: a button with `data-action`, an entry in `actions` in `script.js`, and (if it has a key) an entry in `KEY_ACTIONS`.
- Buttons with symbol-only text (`÷`, `×`, `−`, `⌫`, `±`, `.`) have an `aria-label`. New symbol-only buttons must too.
- The display uses `aria-live="polite"` on `#expression` and `#value`. The calculator container has `aria-label`.
- Event handling is delegated: one click listener on `.calculator` and one `keydown` listener on `document`. Do not add per-button listeners.
- Display text is set via `textContent` only, never `innerHTML`.
- Style: 2-space indent, double quotes, semicolons, `const` and arrow functions, small top-level functions, no frameworks or dependencies, and sparse comments that explain why. Match this.
- Styles live in `styles.css`. Do not add inline styles or scripts to the HTML.

## Severity

- **high**: An action is unusable or broken in the UI, for example a button with no handler, or a script error at load that breaks the page. Give the element or key and what happens.
- **medium**: A real accessibility or usability defect with a concrete consequence. Examples: an icon-only button with no accessible name, so a screen reader announces nothing meaningful; keyboard focus made unreachable or invisible; text that overflows the display and is unreadable at a stated input; `innerHTML` used with input-derived text; a new dependency or build step added without being asked for.
- **low**: Naming, formatting, comment, and minor style or visual preferences. Also generic suggestions such as extracting modules or adding tests, unless the request asked for them.

## Instructions

- Review only the change, not code it does not touch, unless the change makes a problem newly reachable.
- The requested change is the scope. Behavior it does not ask for is not required.
- Do not report arithmetic or state-machine bugs. A separate correctness reviewer owns those.
- Report all findings at once. Do not hold related ones back for a later round.
- Report no findings when nothing clears the bar.
