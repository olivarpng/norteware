export const SIZES = ["P", "M", "G", "GG"];
export const TAGS = ["", "NOVO", "LIMITADO", "ÚLTIMAS"];
export const DROP_STATUS = { open: "Aberto", soon: "Em breve", closed: "Encerrado" };

const text = (value, fallback = "") => (typeof value === "string" ? value.trim() : fallback);
const stock = (value) => (Number.isInteger(value) && value > 0 ? value : 0);

export const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const totalStock = (product) => Object.values(product.sizes).reduce((sum, qty) => sum + qty, 0);
export const isSoldOut = (product) => totalStock(product) === 0;

export function availability(product, dropStatus) {
  if (dropStatus === "soon") return { open: false, label: "Em breve" };
  if (dropStatus === "closed" || isSoldOut(product)) return { open: false, label: "Esgotado" };
  return { open: true, label: "Quero →" };
}

export function uniqueId(base, products) {
  const taken = new Set(products.map((product) => product.id));
  const root = slugify(base) || "peca";
  let id = root;
  for (let n = 2; taken.has(id); n++) id = `${root}-${n}`;
  return id;
}

export function createProduct(products, name = "Nova peça") {
  return normalizeProduct({ id: uniqueId(name, products), name });
}

function normalizeProduct(raw = {}) {
  return {
    id: text(raw.id),
    name: text(raw.name),
    price: typeof raw.price === "number" && raw.price >= 0 ? raw.price : null,
    tag: TAGS.includes(raw.tag) ? raw.tag : "",
    image: text(raw.image),
    active: raw.active !== false,
    sizes: Object.fromEntries(SIZES.map((size) => [size, stock(raw.sizes?.[size])])),
  };
}

export function normalizeCatalog(raw) {
  const source = raw ?? {};
  return {
    drop: {
      edition: text(source.drop?.edition, "01"),
      note: text(source.drop?.note),
      status: Object.hasOwn(DROP_STATUS, source.drop?.status) ? source.drop.status : "open",
    },
    products: (source.products ?? []).map(normalizeProduct),
  };
}

export function validateCatalog({ products }) {
  const errors = [];
  const ids = new Set();

  products.forEach((product, index) => {
    if (!product.name) errors.push(`A peça ${index + 1} está sem nome.`);
    if (ids.has(product.id)) errors.push(`Código repetido: ${product.id}.`);
    ids.add(product.id);
  });

  return errors;
}
