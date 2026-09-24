const valueEl = document.getElementById("value");
const expressionEl = document.getElementById("expression");

// Numbers entered so far, the one being typed, and whether the display shows a result.
let terms = [];
let current = "0";
let showingResult = false;

function formatNumber(n) {
  // Round away floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(n.toPrecision(12)));
}

function render() {
  valueEl.textContent = current;
  expressionEl.textContent = terms.length ? terms.join(" + ") + " +" : "";
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

function add() {
  terms.push(formatNumber(parseFloat(current)));
  current = "0";
  showingResult = false;
  render();
}

function equals() {
  if (!terms.length) return;
  const all = [...terms, formatNumber(parseFloat(current))];
  const sum = all.reduce((acc, n) => acc + parseFloat(n), 0);
  terms = [];
  current = formatNumber(sum);
  showingResult = true;
  render();
  expressionEl.textContent = all.join(" + ") + " =";
}

function clearAll() {
  terms = [];
  current = "0";
  showingResult = false;
  render();
}

function backspace() {
  if (showingResult) return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : "0";
  render();
}

document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.digit) return inputDigit(btn.dataset.digit);
  const actions = { add, equals, clear: clearAll, backspace, decimal: inputDecimal };
  actions[btn.dataset.action]?.();
});

document.addEventListener("keydown", (e) => {
  if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "+") add();
  else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    equals();
  } else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
});

render();
