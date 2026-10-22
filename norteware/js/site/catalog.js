import { h } from "../shared/dom.js";
import { formatPrice } from "../shared/format.js";
import { availability, isSoldOut, normalizeCatalog, SIZES } from "../shared/schema.js";

const DATA_URL = "data/products.json";
const INSTAGRAM_URL = "https://www.instagram.com/nortewearbr/";

export async function renderCatalog() {
  const grid = document.querySelector("#drop-grid");
  if (!grid) return;

  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(response.statusText);

    const { drop, products } = normalizeCatalog(await response.json());
    const visible = products.filter((product) => product.active);

    document.querySelector("#drop-edition").textContent = drop.edition;
    document.querySelector("#drop-note").textContent = drop.note;
    grid.replaceChildren(...(visible.length ? visible.map((p) => productCard(p, drop.status)) : [message("Novo drop em breve.")]));
  } catch {
    grid.replaceChildren(message("Não deu pra carregar o drop agora. Volta já já."));
  }
}

const message = (text) => h("p", { class: "empty" }, text);

function productCard(product, dropStatus) {
  const { open, label } = availability(product, dropStatus);
  const tag = isSoldOut(product) ? "ESGOTADO" : product.tag;

  return h("article", { class: "card", "data-reveal": true },
    h("div", { class: `card__media${product.image ? "" : " placeholder"}` },
      tag && h("span", { class: `tag${tag === "NOVO" || tag === "LIMITADO" ? "" : " tag--light"}` }, tag),
      product.image ? h("img", { src: product.image, alt: product.name, loading: "lazy" }) : h("span", {}, "[FOTO DA PEÇA]")),
    h("div", { class: "card__body" },
      h("h3", { class: "card__title" }, product.name),
      h("ul", { class: "sizes", "aria-label": "Tamanhos" },
        SIZES.map((size) => h("li", { class: `size${product.sizes[size] ? "" : " size--out"}` }, size))),
      h("div", { class: "card__footer" },
        h("span", { class: "card__price" }, formatPrice(product.price)),
        open
          ? h("a", { class: "link", href: INSTAGRAM_URL, target: "_blank", rel: "noopener" }, label)
          : h("span", { class: "link link--off" }, label))));
}
