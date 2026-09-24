const valueEl = document.getElementById("value");
const expressionEl = document.getElementById("expression");

// Committed terms as { op, value } (value always unsigned), the operator
// pending for the next term, the number being typed, and whether the
// display shows a result.
let terms = [];
let pendingOp = "+";
let current = "0";
let showingResult = false;

function formatNumber(n) {
  // Round away floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(n.toPrecision(12)));
}

function opSymbol(op) {
  return op === "-" ? "−" : "+";
}

function render() {
  valueEl.textContent = current;
  if (!terms.length) {
    expressionEl.textContent = "";
    return;
  }
  const parts = terms.map((t, i) => (i === 0 ? t.value : `${opSymbol(t.op)} ${t.value}`));
  expressionEl.textContent = parts.join(" ") + ` ${opSymbol(pendingOp)}`;
}

function inputDigit(d) {
  if (showingResult) {
    current = "0";
    showingResult = false;
  }
  if (current.replace(/[-.]/g, "").length >= 15) return;
  current = current === "0" ? d : current + d;
  render();
}

function inputDecimal() {
  if (showingResult) {
    current = "0";
    showingResult = false;
  }
  if (!current.includes(".")) current += ".";
  render();
}

function commitTerm(nextOp) {
  terms.push({ op: pendingOp, value: formatNumber(parseFloat(current)) });
  pendingOp = nextOp;
  current = "0";
  showingResult = false;
  render();
}

function add() {
  commitTerm("+");
}

function subtract() {
  commitTerm("-");
}

function equals() {
  if (!terms.length) return;
  const all = [...terms, { op: pendingOp, value: formatNumber(parseFloat(current)) }];
  const sum = all.reduce(
    (acc, t) => acc + (t.op === "-" ? -parseFloat(t.value) : parseFloat(t.value)),
    0
  );
  const parts = all.map((t, i) => (i === 0 ? t.value : `${opSymbol(t.op)} ${t.value}`));
  terms = [];
  pendingOp = "+";
  current = formatNumber(sum);
  showingResult = true;
  render();
  expressionEl.textContent = parts.join(" ") + " =";
}

function clearAll() {
  terms = [];
  pendingOp = "+";
  current = "0";
  showingResult = false;
  render();
}

function backspace() {
  if (showingResult) return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : "0";
  render();
}

document.querySelector(".calculator").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.digit) return inputDigit(btn.dataset.digit);
  const actions = { add, subtract, equals, clear: clearAll, backspace, decimal: inputDecimal };
  actions[btn.dataset.action]?.();
});

document.addEventListener("keydown", (e) => {
  if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "+") add();
  else if (e.key === "-") subtract();
  else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    equals();
  } else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
});

render();
