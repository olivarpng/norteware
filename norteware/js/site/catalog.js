import { h } from "../shared/dom.js";
import { formatPrice } from "../shared/format.js";
import { availability, isSoldOut, NO_SIZE, normalizeCatalog } from "../shared/schema.js";

const DATA_URL = "data/products.json";
const FLASH_MS = 1500;

export async function loadCatalog() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(response.statusText);
    return normalizeCatalog(await response.json());
  } catch {
    return null;
  }
}

export function renderCatalog(catalog, { onAdd } = {}) {
  const grid = document.querySelector("#drop-grid");
  if (!grid) return;

  if (!catalog) {
    grid.replaceChildren(message("Não deu pra carregar o drop agora. Volta já já."));
    return;
  }

  document.querySelector("#drop-edition").textContent = catalog.drop.edition;
  document.querySelector("#drop-note").textContent = catalog.drop.note;

  const visible = catalog.products.filter((product) => product.active);
  grid.replaceChildren(...(visible.length ? visible.map((product) => productCard(product, catalog.drop.status, onAdd)) : [message("Novo drop em breve.")]));
}

const message = (text) => h("p", { class: "empty" }, text);

function productCard(product, dropStatus, onAdd) {
  const { open, label } = availability(product, dropStatus);
  const tag = isSoldOut(product) ? "ESGOTADO" : product.tag;
  const sizes = Object.entries(product.sizes);
  const hasSizes = !(sizes.length === 1 && sizes[0][0] === NO_SIZE);

  let selected = hasSizes ? null : NO_SIZE;
  const note = h("p", { class: "card__note", role: "status" });

  const chips = hasSizes
    ? sizes.map(([size, qty]) =>
        h("button", { class: `size${qty ? "" : " size--out"}`, type: "button", "aria-pressed": "false", disabled: !open || !qty, onClick: () => choose(size) }, size))
    : [];

  const addButton = h("button", { class: "btn btn--primary btn--small", type: "button", disabled: !open, onClick: add }, label);

  function choose(size) {
    selected = size;
    note.textContent = "";
    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.textContent === size)));
  }

  function add() {
    if (!selected) {
      note.textContent = "Escolha o tamanho.";
      return;
    }
    if (!onAdd?.(product, selected)) {
      note.textContent = "Você já pegou todo o estoque desse tamanho.";
      return;
    }
    note.textContent = "";
    addButton.textContent = "Adicionado ✓";
    setTimeout(() => (addButton.textContent = label), FLASH_MS);
  }

  return h("article", { class: "card", "data-reveal": true },
    h("div", { class: `card__media${product.image ? "" : " placeholder"}` },
      tag && h("span", { class: `tag${tag === "NOVO" || tag === "LIMITADO" ? "" : " tag--light"}` }, tag),
      product.image ? h("img", { src: product.image, alt: product.name, loading: "lazy" }) : h("span", { class: "card__hint" }, "Foto em breve")),
    h("div", { class: "card__body" },
      h("h3", { class: "card__title" }, product.name),
      hasSizes && h("div", { class: "sizes", role: "group", "aria-label": "Tamanhos" }, chips),
      note,
      h("div", { class: "card__footer" }, h("span", { class: "card__price" }, formatPrice(product.price)), addButton)));
}
