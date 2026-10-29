const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function formatNumber(n) {
  // Round away floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(n.toPrecision(12)));
}

function expressionText(list) {
  return list.map((t) => SYMBOLS[t] ?? t).join(" ");
}

// Evaluate with precedence: × and ÷ bind tighter than + and −.
function evaluate(list) {
  const stack = [parseFloat(list[0])];
  for (let i = 1; i < list.length; i += 2) {
    const op = list[i];
    const n = parseFloat(list[i + 1]);
    if (op === "*") stack.push(stack.pop() * n);
    else if (op === "/") stack.push(stack.pop() / n);
    else stack.push(op === "-" ? -n : n);
  }
  return stack.reduce((a, b) => a + b, 0);
}

const Calc = { SYMBOLS, evaluate, formatNumber, expressionText };
if (typeof module !== "undefined") module.exports = Calc;
else window.Calc = Calc;
