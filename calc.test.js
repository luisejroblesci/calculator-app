const test = require("node:test");
const assert = require("node:assert");
const { evaluate, formatNumber, expressionText } = require("./calc.js");

const calc = (...list) => formatNumber(evaluate(list));

test("multiplication binds tighter than addition", () => {
  assert.equal(calc("2", "+", "3", "*", "4"), "14");
  assert.equal(calc("2", "*", "3", "+", "4"), "10");
});

test("division binds tighter than subtraction", () => {
  assert.equal(calc("10", "-", "6", "/", "2"), "7");
});

test("chained operations", () => {
  assert.equal(calc("1", "+", "2", "+", "3", "+", "4"), "10");
  assert.equal(calc("10", "-", "3", "-", "2"), "5");
  assert.equal(calc("2", "*", "3", "*", "4"), "24");
  assert.equal(calc("100", "/", "5", "/", "4"), "5");
});

test("single number", () => {
  assert.equal(calc("42"), "42");
});

test("floating-point rounding", () => {
  assert.equal(calc("0.1", "+", "0.2"), "0.3");
  assert.equal(formatNumber(0.1 * 3), "0.3");
});

test("negative numbers", () => {
  assert.equal(calc("-2", "*", "3"), "-6");
  assert.equal(calc("-2", "-", "-3"), "1");
  assert.equal(calc("5", "+", "-8"), "-3");
});

test("division by zero is non-finite", () => {
  assert.equal(evaluate(["1", "/", "0"]), Infinity);
  assert.equal(Number.isFinite(evaluate(["0", "/", "0"])), false);
});

test("formatNumber", () => {
  assert.equal(formatNumber(5), "5");
  assert.equal(formatNumber(-1.5), "-1.5");
});

test("expressionText uses display symbols", () => {
  assert.equal(expressionText(["2", "*", "3", "/", "4", "-", "1", "+", "5"]), "2 × 3 ÷ 4 − 1 + 5");
  assert.equal(expressionText([]), "");
});
