import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addSize, availability, createProduct, DEFAULT_WHATSAPP, isSoldOut, normalizeCatalog, removeSize,
  setProductType, slugify, sortSizes, uniqueId, validateCatalog,
} from "../js/shared/schema.js";

test("normalizeCatalog corrige dados quebrados", () => {
  const { drop, products } = normalizeCatalog({
    drop: { status: "invalido" },
    products: [{ name: " Camiseta ", price: -5, tag: "X", type: "?", sizes: { P: -2, M: 3.5, G: 4 } }],
  });

  assert.equal(drop.status, "open");
  assert.deepEqual(products[0].sizes, { P: 0, M: 0, G: 4 });
  assert.equal(products[0].name, "Camiseta");
  assert.equal(products[0].type, "roupa");
  assert.equal(products[0].price, null);
  assert.equal(products[0].tag, "");
  assert.equal(products[0].active, true);
});

test("normalizeCatalog aceita null e usa o WhatsApp padrão", () => {
  const catalog = normalizeCatalog(null);
  assert.deepEqual(catalog.products, []);
  assert.equal(catalog.store.whatsapp, DEFAULT_WHATSAPP);
});

test("WhatsApp é limpo e inválido volta ao padrão", () => {
  assert.equal(normalizeCatalog({ store: { whatsapp: "+55 17 99142-7518" } }).store.whatsapp, "5517991427518");
  assert.equal(normalizeCatalog({ store: { whatsapp: "123" } }).store.whatsapp, DEFAULT_WHATSAPP);
});

test("calçado mantém numerações e ordena do menor para o maior", () => {
  const [shoe] = normalizeCatalog({ products: [{ name: "Vans", type: "calcado", sizes: { 41: 2, 38: 1, 40: 0 } }] }).products;
  assert.deepEqual(Object.keys(shoe.sizes), ["38", "40", "41"]);
  assert.equal(shoe.type, "calcado");
});

test("sortSizes põe roupa na ordem de uso, depois números, depois texto", () => {
  assert.deepEqual(sortSizes(["GG", "Outro", "42", "P", "G", "M", "9"]), ["P", "M", "G", "GG", "9", "42", "Outro"]);
});

test("trocar o tipo troca a lista de tamanhos", () => {
  const product = createProduct([], "Vans");
  setProductType(product, "calcado");
  assert.equal(product.type, "calcado");
  assert.deepEqual(Object.keys(product.sizes), ["36", "37", "38", "39", "40", "41", "42", "43", "44"]);

  setProductType(product, "unico");
  assert.deepEqual(product.sizes, { Único: 0 });
});

test("addSize e removeSize mantêm a ordem e ignoram repetidos", () => {
  const product = createProduct([], "Camiseta");
  addSize(product, "XG");
  addSize(product, "G");
  addSize(product, "  ");
  assert.deepEqual(Object.keys(product.sizes), ["P", "M", "G", "GG", "XG"]);

  removeSize(product, "P");
  assert.deepEqual(Object.keys(product.sizes), ["M", "G", "GG", "XG"]);
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
  assert.deepEqual(availability(inStock, "open"), { open: true, label: "Adicionar" });
  assert.equal(availability(inStock, "soon").label, "Em breve");
  assert.equal(availability(inStock, "closed").label, "Esgotado");
  assert.equal(availability({ sizes: { P: 0 } }, "open").label, "Esgotado");
});

test("validateCatalog acusa nome vazio, código repetido e WhatsApp inválido", () => {
  const errors = validateCatalog({ store: { whatsapp: "1" }, products: [{ id: "a", name: "" }, { id: "a", name: "B" }] });
  assert.equal(errors.length, 3);
  assert.deepEqual(validateCatalog({ store: { whatsapp: DEFAULT_WHATSAPP }, products: [] }), []);
});
