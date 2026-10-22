import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrice, parsePrice } from "../js/shared/format.js";

test("parsePrice entende vírgula, ponto e milhar", () => {
  assert.equal(parsePrice("89,90"), 89.9);
  assert.equal(parsePrice("89.90"), 89.9);
  assert.equal(parsePrice("1.299,90"), 1299.9);
  assert.equal(parsePrice("R$ 120"), 120);
});

test("parsePrice devolve null para vazio ou inválido", () => {
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice("abc"), null);
});

test("formatPrice mostra Consultar sem preço e reais com preço", () => {
  assert.equal(formatPrice(null), "Consultar");
  assert.match(formatPrice(89.9).replace(/\s/g, " "), /^R\$ 89,90$/);
});
