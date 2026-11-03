export const NO_SIZE = "Único";
export const DEFAULT_WHATSAPP = "5517991427518";

export const PRODUCT_TYPES = {
  roupa: { label: "Roupa", sizes: ["P", "M", "G", "GG"] },
  calcado: { label: "Calçado", sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"] },
  unico: { label: "Único (sem tamanho)", sizes: [NO_SIZE] },
};

export const TAGS = ["", "NOVO", "LIMITADO", "ÚLTIMAS"];
export const DROP_STATUS = { open: "Aberto", soon: "Em breve", closed: "Encerrado" };

const CLOTHING_ORDER = ["PP", "P", "M", "G", "GG", "XG", "GGG"];

const text = (value, fallback = "") => (typeof value === "string" ? value.trim() : fallback);
const stock = (value) => (Number.isInteger(value) && value > 0 ? value : 0);
const sizeLabel = (value) => String(value ?? "").trim().slice(0, 8);

export const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");
export const isValidWhatsapp = (number) => /^\d{12,13}$/.test(number);

export const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function sizeRank(label) {
  const clothing = CLOTHING_ORDER.indexOf(label.toUpperCase());
  if (clothing >= 0) return [0, clothing, ""];
  const number = Number(label.replace(",", "."));
  return Number.isFinite(number) ? [1, number, ""] : [2, 0, label];
}

export function sortSizes(labels) {
  return [...labels].sort((a, b) => {
    const [groupA, numA, textA] = sizeRank(a);
    const [groupB, numB, textB] = sizeRank(b);
    return groupA - groupB || numA - numB || textA.localeCompare(textB, "pt-BR");
  });
}

export const sizesFor = (type) => Object.fromEntries(PRODUCT_TYPES[type].sizes.map((size) => [size, 0]));

export function setProductType(product, type) {
  product.type = type;
  product.sizes = sizesFor(type);
}

export function addSize(product, label) {
  const clean = sizeLabel(label);
  if (!clean || Object.hasOwn(product.sizes, clean)) return;
  const labels = sortSizes([...Object.keys(product.sizes), clean]);
  product.sizes = Object.fromEntries(labels.map((size) => [size, product.sizes[size] ?? 0]));
}

export const removeSize = (product, label) => {
  delete product.sizes[label];
};

export const totalStock = (product) => Object.values(product.sizes).reduce((sum, qty) => sum + qty, 0);
export const isSoldOut = (product) => totalStock(product) === 0;

export function availability(product, dropStatus) {
  if (dropStatus === "soon") return { open: false, label: "Em breve" };
  if (dropStatus === "closed" || isSoldOut(product)) return { open: false, label: "Esgotado" };
  return { open: true, label: "Adicionar" };
}

export function uniqueId(base, products) {
  const taken = new Set(products.map((product) => product.id));
  const root = slugify(base) || "peca";
  let id = root;
  for (let n = 2; taken.has(id); n++) id = `${root}-${n}`;
  return id;
}

export function createProduct(products, name = "Nova peça", type = "roupa") {
  return normalizeProduct({ id: uniqueId(name, products), name, type });
}

function normalizeProduct(raw = {}) {
  const type = Object.hasOwn(PRODUCT_TYPES, raw.type) ? raw.type : "roupa";
  const stockBySize = new Map(
    Object.entries(raw.sizes ?? {})
      .map(([label, qty]) => [sizeLabel(label), stock(qty)])
      .filter(([label]) => label)
  );
  const sizes = stockBySize.size
    ? Object.fromEntries(sortSizes(stockBySize.keys()).map((label) => [label, stockBySize.get(label)]))
    : sizesFor(type);

  return {
    id: text(raw.id),
    name: text(raw.name),
    type,
    price: typeof raw.price === "number" && raw.price >= 0 ? raw.price : null,
    tag: TAGS.includes(raw.tag) ? raw.tag : "",
    image: text(raw.image),
    active: raw.active !== false,
    sizes,
  };
}

export function normalizeCatalog(raw) {
  const source = raw ?? {};
  const whatsapp = digitsOnly(source.store?.whatsapp);

  return {
    store: { whatsapp: isValidWhatsapp(whatsapp) ? whatsapp : DEFAULT_WHATSAPP },
    drop: {
      edition: text(source.drop?.edition, "01"),
      note: text(source.drop?.note),
      status: Object.hasOwn(DROP_STATUS, source.drop?.status) ? source.drop.status : "open",
    },
    products: (source.products ?? []).map(normalizeProduct),
  };
}

export function validateCatalog({ products, store }) {
  const errors = [];
  const ids = new Set();

  if (!isValidWhatsapp(store.whatsapp)) errors.push("WhatsApp inválido: use 55 + DDD + número.");

  products.forEach((product, index) => {
    if (!product.name) errors.push(`A peça ${index + 1} está sem nome.`);
    if (ids.has(product.id)) errors.push(`Código repetido: ${product.id}.`);
    ids.add(product.id);
  });

  return errors;
}
