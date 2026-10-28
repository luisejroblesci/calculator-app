# UI and accessibility review

Review the diff for changes to `index.html` and `styles.css`.

Check in particular:
- Every button has an accessible name (not just a symbol such as `−` or `⌫`).
- The display and expression areas are announced to assistive tech appropriately (e.g. `aria-live` on the result).
- Keyboard operation works without a mouse and focus styles are visible.
- Color contrast meets WCAG AA for text and buttons.
- Layout holds at narrow widths and with long values (15 digits plus a decimal and sign) without overflow.

Cite the element or selector for each finding and suggest a minimal fix.
