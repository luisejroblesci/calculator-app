const test = require("node:test");
const assert = require("node:assert/strict");
const { formatNumber, opSymbol, sumTerms } = require("./calc.js");

test("formatNumber rounds away floating point noise", () => {
  assert.equal(formatNumber(0.1 + 0.2), "0.3");
});

test("formatNumber preserves negative values", () => {
  assert.equal(formatNumber(-42.5), "-42.5");
});

test("opSymbol maps '-' to the unicode minus sign", () => {
  assert.equal(opSymbol("-"), "−");
});

test("opSymbol maps '+' to '+'", () => {
  assert.equal(opSymbol("+"), "+");
});

test("sumTerms adds a single positive term", () => {
  assert.equal(sumTerms([{ op: "+", value: "5" }]), 5);
});

test("sumTerms subtracts when op is '-'", () => {
  assert.equal(sumTerms([{ op: "+", value: "2" }, { op: "-", value: "5" }]), -3);
});

test("sumTerms handles decimals", () => {
  assert.equal(sumTerms([{ op: "+", value: "0.1" }, { op: "+", value: "0.2" }]), 0.30000000000000004);
});
