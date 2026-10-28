# UI and accessibility review

This reviewer covers changes to `index.html` and `styles.css` for this calculator. The markup already uses `aria-live` regions on the display, `aria-label` on symbol-only buttons (e.g. `⌫`, `−`, `=`), a `:focus-visible` outline, and CSS custom properties for light/dark theming (`prefers-color-scheme`). Judge new markup and styles against that existing bar.

## What to check

- Every button has an accessible name: either visible text or an `aria-label`/`aria-labelledby` when the visible content is a symbol or icon.
- Live regions remain correct: the result and expression areas should stay announced via `aria-live` (or equivalent) after the change, without becoming so chatty they spam a screen reader on every keystroke.
- Keyboard operability: new interactive elements must be reachable and operable via keyboard (focusable, visible `:focus-visible` style, no keyboard trap), matching the existing pattern.
- Color contrast: new or changed text/background color pairs meet WCAG AA (4.5:1 for normal text) in both the light and dark `:root` variable sets.
- Layout robustness: the display and key grid should hold at narrow viewport widths and with long values (up to 15 digits plus a decimal point and a leading `-`) without clipping or overflow outside the `.calculator` card.

## Severity

- **High**: a new or changed interactive element has no accessible name and no visible label at all, or a color pair that fails WCAG AA by a wide margin (e.g. low-contrast text on its own background in either theme), or content that is clipped/unreadable at the calculator's stated minimum width with a full-length value.
- **Medium**: a live region change that stops the result/expression from being announced, a focus style that is removed or made invisible for a new element, or contrast that fails AA narrowly in one theme.
- **Low**: everything else — spacing, visual polish, minor semantic preferences (e.g. `<button>` vs. `role="button"` when both are already accessible).

Cite the specific element or selector for each finding and what minimal change would fix it. Review only the markup and styles the diff touches or newly makes reachable.
