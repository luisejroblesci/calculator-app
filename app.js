const { createApp, reactive, computed, onMounted, onUnmounted } = Vue;
const { evaluate, formatNumber, expressionText } = Calc;

const MAX_DIGITS = 15;

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

function fireConfetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
}

createApp({
  template: `
    <main class="calculator" aria-label="Calculator">
      <div class="display">
        <div class="expression" aria-live="polite">{{ expression }}</div>
        <div class="value" aria-live="polite">{{ state.current }}</div>
      </div>
      <div class="keys">
        <button v-for="b in buttons" :key="b.label" :class="b.class"
                :aria-label="b.aria" @click="b.run">{{ b.label }}</button>
      </div>
    </main>`,
  setup() {
    // tokens alternates number strings and operators ("+", "-", "*", "/"),
    // current is the number being typed, entered says whether current was
    // typed since the last operator, and showingResult marks a finished result.
    const state = reactive({
      tokens: [],
      current: "0",
      entered: true,
      showingResult: false,
      resultText: "",
    });

    const expression = computed(() =>
      state.showingResult ? state.resultText : expressionText(state.tokens)
    );

    const isError = () => state.current === "Error";

    function startFresh() {
      if (state.showingResult) {
        state.tokens = [];
        state.current = "0";
        state.showingResult = false;
      }
      state.entered = true;
    }

    function inputDigit(d) {
      startFresh();
      if (state.current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
      if (state.current === "0") state.current = d;
      else if (state.current === "-0") state.current = "-" + d;
      else state.current += d;
    }

    function inputDecimal() {
      startFresh();
      if (!state.current.includes(".")) state.current += ".";
    }

    function operator(op) {
      if (isError()) return;
      if (!state.entered && state.tokens.length) {
        // Changing our mind about the operator
        state.tokens[state.tokens.length - 1] = op;
      } else {
        state.tokens.push(formatNumber(parseFloat(state.current)), op);
      }
      state.current = "0";
      state.entered = false;
      state.showingResult = false;
    }

    function equals() {
      // Confetti fires on every press of =, even when there is nothing to compute.
      fireConfetti();
      if (!state.tokens.length || isError()) return;
      const list = state.entered
        ? [...state.tokens, formatNumber(parseFloat(state.current))]
        : state.tokens.slice(0, -1);
      const result = evaluate(list);
      state.resultText = expressionText(list) + " =";
      state.tokens = [];
      state.showingResult = true;
      state.entered = true;
      state.current = Number.isFinite(result) ? formatNumber(result) : "Error";
    }

    function percent() {
      if (isError()) return;
      state.current = formatNumber(parseFloat(state.current) / 100);
      state.entered = true;
    }

    function negate() {
      if (isError() || state.current === "0") return;
      state.current = state.current.startsWith("-")
        ? state.current.slice(1)
        : "-" + state.current;
    }

    function clearAll() {
      state.tokens = [];
      state.current = "0";
      state.entered = true;
      state.showingResult = false;
    }

    function backspace() {
      if (state.showingResult || isError()) return clearAll();
      if (!state.entered) return;
      state.current =
        state.current.length > 1 && state.current !== "-0"
          ? state.current.slice(0, -1)
          : "0";
      if (state.current === "-") state.current = "0";
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

    const digit = (d) => ({ label: d, class: "key", run: () => press(() => inputDigit(d)) });
    const act = (label, name, cls, aria) => ({
      label,
      class: "key " + cls,
      aria,
      run: () => press(actions[name]),
    });
    const plain = (label, name, aria) => ({ ...act(label, name, "", aria), class: "key" });

    const buttons = [
      act("C", "clear", "fn"),
      act("⌫", "backspace", "fn", "Backspace"),
      act("%", "percent", "fn", "Percent"),
      act("÷", "divide", "op", "Divide"),
      digit("7"), digit("8"), digit("9"),
      act("×", "multiply", "op", "Multiply"),
      digit("4"), digit("5"), digit("6"),
      act("−", "subtract", "op", "Minus"),
      digit("1"), digit("2"), digit("3"),
      act("+", "add", "op", "Plus"),
      act("±", "negate", "fn", "Toggle sign"),
      digit("0"),
      plain(".", "decimal", "Decimal point"),
      act("=", "equals", "eq", "Equals"),
    ];

    function onKeydown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) return press(() => inputDigit(e.key));
      const name = KEY_ACTIONS[e.key] ?? KEY_ACTIONS[e.key.toLowerCase()];
      if (!name) return;
      e.preventDefault();
      press(actions[name]);
    }

    onMounted(() => document.addEventListener("keydown", onKeydown));
    onUnmounted(() => document.removeEventListener("keydown", onKeydown));

    return { state, expression, buttons };
  },
}).mount("#app");
