import assert from "node:assert/strict";
import { test } from "node:test";
import { availability, createProduct, isSoldOut, normalizeCatalog, slugify, uniqueId, validateCatalog } from "../js/shared/schema.js";

test("normalizeCatalog corrige dados quebrados", () => {
  const catalog = normalizeCatalog({
    drop: { status: "invalido" },
    products: [{ name: " Camiseta ", price: -5, tag: "X", sizes: { P: -2, M: 3.5, G: 4 } }],
  });

  assert.equal(catalog.drop.status, "open");
  assert.deepEqual(catalog.products[0].sizes, { P: 0, M: 0, G: 4, GG: 0 });
  assert.equal(catalog.products[0].name, "Camiseta");
  assert.equal(catalog.products[0].price, null);
  assert.equal(catalog.products[0].tag, "");
  assert.equal(catalog.products[0].active, true);
});

test("normalizeCatalog aceita null", () => {
  assert.deepEqual(normalizeCatalog(null).products, []);
});

test("slugify e uniqueId geram códigos estáveis", () => {
  assert.equal(slugify("Calça Cargo Preta!"), "calca-cargo-preta");
  assert.equal(uniqueId("Boné", [{ id: "bone" }, { id: "bone-2" }]), "bone-3");
});

test("peça sem estoque conta como esgotada", () => {
  const product = createProduct([], "Moletom");
  assert.equal(isSoldOut(product), true);
  product.sizes.M = 2;
  assert.equal(isSoldOut(product), false);
});

test("availability respeita a situação do drop e o estoque", () => {
  const inStock = { sizes: { P: 1 } };
  assert.deepEqual(availability(inStock, "open"), { open: true, label: "Quero →" });
  assert.equal(availability(inStock, "soon").label, "Em breve");
  assert.equal(availability(inStock, "closed").label, "Esgotado");
  assert.equal(availability({ sizes: { P: 0 } }, "open").label, "Esgotado");
});

test("validateCatalog acusa nome vazio e código repetido", () => {
  const errors = validateCatalog({ products: [{ id: "a", name: "" }, { id: "a", name: "B" }] });
  assert.equal(errors.length, 2);
});
