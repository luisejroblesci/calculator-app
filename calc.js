// Pure calculator logic, shared between the browser (script.js) and Node tests.
// Loaded as a plain global in the browser and via module.exports under Node.

function formatNumber(n) {
  // Round away floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(n.toPrecision(12)));
}

function opSymbol(op) {
  return op === "-" ? "−" : "+";
}

function sumTerms(terms) {
  return terms.reduce(
    (acc, t) => acc + (t.op === "-" ? -parseFloat(t.value) : parseFloat(t.value)),
    0
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { formatNumber, opSymbol, sumTerms };
}
