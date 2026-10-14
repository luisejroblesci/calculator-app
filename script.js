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

const confettiCanvas = document.getElementById("confetti");
const confettiColors = ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#43aa8b", "#577590", "#b5179e"];
let confettiPieces = [];
let confettiRunning = false;

function confetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const w = (confettiCanvas.width = window.innerWidth);
  const h = (confettiCanvas.height = window.innerHeight);
  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 2,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(stepConfetti);
  }
}

function stepConfetti() {
  const ctx = confettiCanvas.getContext("2d");
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 20);
  for (const p of confettiPieces) {
    p.vy += 0.35;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  if (confettiPieces.length) requestAnimationFrame(stepConfetti);
  else confettiRunning = false;
}

document.querySelector(".calculator").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.digit) return inputDigit(btn.dataset.digit);
  const actions = { add, subtract, equals, clear: clearAll, backspace, decimal: inputDecimal, confetti };
  actions[btn.dataset.action]?.();
});

document.addEventListener("keydown", (e) => {
  if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "+") add();
  else if (e.key === "-") subtract();
  else if ((e.key === "Enter" && !e.target.closest('[data-action="confetti"]')) || e.key === "=") {
    e.preventDefault();
    equals();
  } else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
});

render();
