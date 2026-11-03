import { formatPrice } from "./format.js";
import { NO_SIZE } from "./schema.js";

const findProduct = (products, id) => products.find((product) => product.id === id && product.active);
const stockOf = (product, size) => (product && Object.hasOwn(product.sizes, size) ? product.sizes[size] : 0);
const same = (item, productId, size) => item.productId === productId && item.size === size;
const money = (value) => formatPrice(value).replace(/\s/g, " ");

export function addItem(items, product, size) {
  const current = items.find((item) => same(item, product.id, size));
  const qty = (current?.qty ?? 0) + 1;
  if (qty > stockOf(product, size)) return items;

  return current
    ? items.map((item) => (item === current ? { ...item, qty } : item))
    : [...items, { productId: product.id, size, qty }];
}

export function setQty(items, productId, size, qty, products) {
  const limit = stockOf(findProduct(products, productId), size);
  const next = Math.min(Math.floor(qty), limit);

  return items.flatMap((item) => {
    if (!same(item, productId, size)) return [item];
    return next > 0 ? [{ ...item, qty: next }] : [];
  });
}

export const removeItem = (items, productId, size) => items.filter((item) => !same(item, productId, size));

export function reconcile(items, products) {
  return items.flatMap((item) => {
    const size = String(item.size);
    const qty = Math.min(Math.floor(Number(item.qty)) || 0, stockOf(findProduct(products, item.productId), size));
    return qty > 0 ? [{ productId: item.productId, size, qty }] : [];
  });
}

export function resolveLines(items, products) {
  return items.flatMap((item) => {
    const product = findProduct(products, item.productId);
    if (!product) return [];
    const subtotal = product.price == null ? null : Math.round(product.price * item.qty * 100) / 100;
    return [{ ...item, product, subtotal }];
  });
}

export function totals(lines) {
  const priced = lines.filter((line) => line.subtotal != null);
  return {
    count: lines.reduce((sum, line) => sum + line.qty, 0),
    total: priced.reduce((sum, line) => sum + line.subtotal, 0),
    hasPriced: priced.length > 0,
    hasUnpriced: priced.length < lines.length,
  };
}

export function totalLabel(lines) {
  const { total, hasPriced, hasUnpriced } = totals(lines);
  if (!hasPriced) return "";
  return `Total: ${money(total)}${hasUnpriced ? " + itens a consultar" : ""}`;
}

export function validateOrder({ name, lines, extra }) {
  if (!name.trim()) return "Escreva seu nome pra gente saber com quem falar.";
  if (!lines.length && !extra.trim()) return "Escolha um item ou conte o que você procura.";
  return null;
}

function describeLine({ product, size, qty, subtotal }) {
  const label = size === NO_SIZE ? product.name : `${product.name} — ${size}`;
  const price = subtotal == null ? "" : ` — ${money(subtotal)}`;
  return `• ${label} (${qty}x)${price}`;
}

export function buildMessage({ name, lines, extra }) {
  const parts = [`Olá! Meu nome é ${name.trim()}.`];

  if (lines.length) {
    parts.push(["Quero:", ...lines.map(describeLine)].join("\n"));
    const total = totalLabel(lines);
    if (total) parts.push(total);
  }

  const note = extra.trim();
  if (note) parts.push(`Outros itens ou dúvidas: ${note}`);

  return parts.join("\n\n");
}

export const whatsappUrl = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
