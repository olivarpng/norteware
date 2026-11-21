import { h } from "../shared/dom.js";
import { formatPrice } from "../shared/format.js";
import { availability, CATEGORIES, isSoldOut, NO_SIZE, normalizeCatalog } from "../shared/schema.js";

const DATA_URL = "data/products.json";
const FLASH_MS = 1500;
const ALL = "todos";

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
  const tabs = document.querySelector("#drop-tabs");
  if (!grid) return;

  if (!catalog) {
    grid.replaceChildren(message("Não deu pra carregar o drop agora. Volta já já."));
    return;
  }

  document.querySelector("#drop-edition").textContent = catalog.drop.edition;
  document.querySelector("#drop-note").textContent = catalog.drop.note;

  renderMore(catalog.store.catalogUrl);

  const visible = catalog.products.filter((product) => product.active);
  if (!visible.length) {
    grid.replaceChildren(message("Novo drop em breve."));
    return;
  }

  const categories = [[ALL, "Todos"], ...Object.entries(CATEGORIES).map(([key, { label }]) => [key, label])]
    .filter(([key]) => key !== "outros" || visible.some((product) => product.category === "outros"));
  const buttons = categories.map(([key, label]) =>
    h("button", { class: "tab", type: "button", role: "tab", id: `tab-${key}`, "aria-controls": "drop-grid", onClick: () => select(key) }, label));

  function select(key, { focus = false } = {}) {
    buttons.forEach((button, index) => {
      const active = categories[index][0] === key;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });

    const items = visible.filter((product) => key === ALL || product.category === key);
    const label = categories.find(([id]) => id === key)[1];
    grid.setAttribute("aria-labelledby", `tab-${key}`);
    grid.replaceChildren(...(items.length ? items.map((product) => productCard(product, catalog.drop.status, onAdd)) : [message(`Ainda não temos peças em ${label}. Volta em breve!`)]));
  }

  tabs.addEventListener("keydown", (event) => {
    const current = buttons.findIndex((button) => button.getAttribute("aria-selected") === "true");
    const moves = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: buttons.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(categories[(moves[event.key] + buttons.length) % buttons.length][0], { focus: true });
  });

  tabs.replaceChildren(...buttons);
  tabs.hidden = false;
  select(ALL);
}

const message = (text) => h("p", { class: "empty" }, text);

function renderMore(url) {
  const more = document.querySelector("#drop-more");
  if (!more) return;

  more.hidden = !url;
  if (!url) return;

  more.replaceChildren(
    h("div", {},
      h("h3", { class: "more__title" }, "Não achou o que procura?"),
      h("p", { class: "more__text" }, "Tem mais peças no catálogo completo. Dá uma olhada e chama a gente pelo WhatsApp com a que você quiser.")),
    h("a", { class: "btn", href: url, target: "_blank", rel: "noopener" }, "Ver catálogo completo ↗"));
}

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

  return h("article", { class: "card" },
    h("div", { class: `card__media${product.image ? "" : " placeholder"}` },
      tag && h("span", { class: `tag${tag === "NOVO" || tag === "LIMITADO" ? "" : " tag--light"}` }, tag),
      product.image ? h("img", { src: product.image, alt: product.name, loading: "lazy" }) : h("span", { class: "card__hint" }, "Foto em breve")),
    h("div", { class: "card__body" },
      h("h3", { class: "card__title" }, product.name),
      hasSizes && h("div", { class: "sizes", role: "group", "aria-label": "Tamanhos" }, chips),
      note,
      h("div", { class: "card__footer" }, h("span", { class: "card__price" }, formatPrice(product.price)), addButton)));
}
