// Stand-in for a one-shot coding-agent task (see DEMO.md for why this is a
// deterministic script rather than a real agent invocation in this run).
// Performs a mechanical refactor: extract the magic number 15 in
// inputDigit()'s digit-limit check into a named MAX_DIGITS constant.
const fs = require("fs");
let s = fs.readFileSync("script.js", "utf8");

if (s.includes("MAX_DIGITS")) {
  console.log("refactor already applied: MAX_DIGITS already present, no-op");
} else {
  s = s.replace(
    'let showingResult = false;\n',
    'let showingResult = false;\nconst MAX_DIGITS = 15;\n'
  );
  s = s.replace(
    'current.replace(/[-.]/g, "").length >= 15',
    'current.replace(/[-.]/g, "").length >= MAX_DIGITS'
  );
  fs.writeFileSync("script.js", s);
  console.log("refactor applied: extracted MAX_DIGITS constant");
}
