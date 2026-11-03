import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addItem, buildMessage, reconcile, removeItem, resolveLines, setQty, totalLabel, validateOrder, whatsappUrl,
} from "../js/shared/cart.js";

const tshirt = { id: "camiseta", name: "Camiseta", active: true, price: 89.9, sizes: { P: 1, G: 3 } };
const shoe = { id: "vans", name: "Vans", active: true, price: 200, sizes: { 41: 1, 42: 0 } };
const cap = { id: "bone", name: "Boné", active: true, price: null, sizes: { Único: 5 } };
const products = [tshirt, shoe, cap];

test("addItem soma a quantidade e respeita o estoque do tamanho", () => {
  let items = addItem([], tshirt, "G");
  items = addItem(items, tshirt, "G");
  assert.deepEqual(items, [{ productId: "camiseta", size: "G", qty: 2 }]);

  items = addItem(items, tshirt, "P");
  assert.equal(items.length, 2);
  assert.equal(addItem(items, tshirt, "P"), items);
  assert.equal(addItem([], shoe, "42").length, 0);
  assert.equal(addItem([], tshirt, "constructor").length, 0);
});

test("setQty limita ao estoque e zero remove", () => {
  const items = [{ productId: "camiseta", size: "G", qty: 2 }];
  assert.equal(setQty(items, "camiseta", "G", 99, products)[0].qty, 3);
  assert.deepEqual(setQty(items, "camiseta", "G", 0, products), []);
  assert.deepEqual(removeItem(items, "camiseta", "G"), []);
});

test("reconcile tira o que sumiu do catálogo e ajusta o que passou do estoque", () => {
  const stored = [
    { productId: "camiseta", size: "P", qty: 5 },
    { productId: "vans", size: "42", qty: 1 },
    { productId: "nao-existe", size: "G", qty: 1 },
    { productId: "bone", size: "Único", qty: "2" },
  ];
  assert.deepEqual(reconcile(stored, products), [
    { productId: "camiseta", size: "P", qty: 1 },
    { productId: "bone", size: "Único", qty: 2 },
  ]);
  assert.deepEqual(reconcile([{ productId: "camiseta", size: "P", qty: 1 }], [{ ...tshirt, active: false }]), []);
});

test("mensagem só com itens do carrinho, sem a linha de outros itens", () => {
  const lines = resolveLines([{ productId: "camiseta", size: "G", qty: 1 }, { productId: "vans", size: "41", qty: 1 }], products);
  const text = buildMessage({ name: " Maria Silva ", lines, extra: "   " });

  assert.equal(text, [
    "Olá! Meu nome é Maria Silva.",
    "Quero:\n• Camiseta — G (1x) — R$ 89,90\n• Vans — 41 (1x) — R$ 200,00",
    "Total: R$ 289,90",
  ].join("\n\n"));
  assert.ok(!text.includes("Outros itens"));
});

test("mensagem com itens e texto livre", () => {
  const lines = resolveLines([{ productId: "camiseta", size: "G", qty: 2 }], products);
  const text = buildMessage({ name: "Ana", lines, extra: "calça M, tênis Vans 41" });
  assert.match(text, /• Camiseta — G \(2x\) — R\$ 179,80/);
  assert.match(text, /Outros itens ou dúvidas: calça M, tênis Vans 41$/);
});

test("mensagem só com texto livre não leva Quero nem Total", () => {
  assert.equal(buildMessage({ name: "Ana", lines: [], extra: "calça M" }), "Olá! Meu nome é Ana.\n\nOutros itens ou dúvidas: calça M");
});

test("item sem preço e produto sem tamanho", () => {
  const onlyCap = resolveLines([{ productId: "bone", size: "Único", qty: 1 }], products);
  assert.equal(buildMessage({ name: "Ana", lines: onlyCap, extra: "" }), "Olá! Meu nome é Ana.\n\nQuero:\n• Boné (1x)");
  assert.equal(totalLabel(onlyCap), "");

  const mixed = resolveLines([{ productId: "vans", size: "41", qty: 1 }, { productId: "bone", size: "Único", qty: 1 }], products);
  assert.equal(totalLabel(mixed), "Total: R$ 200,00 + itens a consultar");
});

test("validateOrder exige nome e algo para pedir", () => {
  const lines = resolveLines([{ productId: "camiseta", size: "G", qty: 1 }], products);
  assert.match(validateOrder({ name: " ", lines, extra: "" }), /nome/);
  assert.match(validateOrder({ name: "Ana", lines: [], extra: "  " }), /Escolha/);
  assert.equal(validateOrder({ name: "Ana", lines, extra: "" }), null);
  assert.equal(validateOrder({ name: "Ana", lines: [], extra: "calça M" }), null);
});

test("whatsappUrl codifica acentos, quebras de linha e símbolos", () => {
  const url = whatsappUrl("5517991427518", "Olá! Quero:\n• Camiseta & boné");
  assert.ok(url.startsWith("https://wa.me/5517991427518?text="));
  assert.equal(decodeURIComponent(url.split("?text=")[1]), "Olá! Quero:\n• Camiseta & boné");
});
