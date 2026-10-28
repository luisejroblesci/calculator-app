const valueEl = document.getElementById("value");
const expressionEl = document.getElementById("expression");

const MAX_DIGITS = 15;

// tokens alternates number strings and operators ("+", "-", "*", "/"),
// current is the number being typed, entered says whether current was
// typed since the last operator, and showingResult marks a finished result.
let tokens = [];
let current = "0";
let entered = true;
let showingResult = false;

function isError() {
  return current === "Error";
}

function render() {
  valueEl.textContent = current;
  expressionEl.textContent = expressionText(tokens);
}

function startFresh() {
  if (showingResult) {
    tokens = [];
    current = "0";
    showingResult = false;
  }
  entered = true;
}

function inputDigit(d) {
  startFresh();
  if (current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
  if (current === "0") current = d;
  else if (current === "-0") current = "-" + d;
  else current += d;
  render();
}

function inputDecimal() {
  startFresh();
  if (!current.includes(".")) current += ".";
  render();
}

function operator(op) {
  if (isError()) return;
  if (!entered && tokens.length) {
    // Changing our mind about the operator
    tokens[tokens.length - 1] = op;
  } else {
    tokens.push(formatNumber(parseFloat(current)), op);
  }
  current = "0";
  entered = false;
  showingResult = false;
  render();
}

function equals() {
  if (!tokens.length || isError()) return;
  const list = entered ? [...tokens, formatNumber(parseFloat(current))] : tokens.slice(0, -1);
  const result = evaluate(list);
  const text = expressionText(list) + " =";
  tokens = [];
  showingResult = true;
  entered = true;
  current = Number.isFinite(result) ? formatNumber(result) : "Error";
  render();
  expressionEl.textContent = text;
}

function percent() {
  if (isError()) return;
  current = formatNumber(parseFloat(current) / 100);
  entered = true;
  render();
}

function negate() {
  if (isError() || current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  render();
}

function clearAll() {
  tokens = [];
  current = "0";
  entered = true;
  showingResult = false;
  render();
}

function backspace() {
  if (showingResult || isError()) return clearAll();
  if (!entered) return;
  current = current.length > 1 && current !== "-0" ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  render();
}

const actions = {
  add: () => operator("+"),
  subtract: () => operator("-"),
  multiply: () => operator("*"),
  divide: () => operator("/"),
  equals,
  percent,
  negate,
  clear: clearAll,
  backspace,
  decimal: inputDecimal,
};

function press(fn) {
  if (isError() && fn !== clearAll && fn !== backspace) clearAll();
  fn();
}

document.querySelector(".calculator").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.digit) return press(() => inputDigit(btn.dataset.digit));
  const fn = actions[btn.dataset.action];
  if (fn) press(fn);
});

const KEY_ACTIONS = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  x: "multiply",
  "/": "divide",
  "%": "percent",
  ".": "decimal",
  ",": "decimal",
  "=": "equals",
  Enter: "equals",
  Backspace: "backspace",
  Escape: "clear",
  c: "clear",
};

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^[0-9]$/.test(e.key)) return press(() => inputDigit(e.key));
  const name = KEY_ACTIONS[e.key] ?? KEY_ACTIONS[e.key.toLowerCase()];
  if (!name) return;
  e.preventDefault();
  press(actions[name]);
});

render();
