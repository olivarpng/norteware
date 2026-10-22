import { h } from "../../../js/shared/dom.js";
import { parsePrice } from "../../../js/shared/format.js";
import { DROP_STATUS, SIZES, TAGS, totalStock } from "../../../js/shared/schema.js";
import { field } from "./field.js";

const button = (label, onClick, extra = "") => h("button", { class: `btn btn--small ${extra}`.trim(), type: "button", onClick }, label);

export function renderEditor(state, actions) {
  const { catalog, dirty, busy, message } = state;

  return h("main", { class: "panel" },
    h("header", { class: "topbar" },
      h("h1", { class: "topbar__title" }, "Painel Norte"),
      h("div", { class: "topbar__actions" },
        h("a", { class: "link", href: "../", target: "_blank", rel: "noopener" }, "Ver site"),
        button("Sair", actions.logout),
        h("button", { class: "btn btn--primary btn--small", type: "button", "data-save": true, disabled: !dirty || busy, onClick: actions.save }, busy ? "Aguarde…" : "Salvar alterações"))),
    h("p", { class: "status", role: "status" }, message),
    dropBox(catalog.drop, actions.edit),
    h("section", { "aria-label": "Peças" }, catalog.products.map((product, index) => productItem(product, index, state, actions))),
    h("div", { class: "box" }, button("+ Nova peça", actions.add)));
}

function dropBox(drop, edit) {
  return h("section", { class: "box" },
    h("h2", { class: "box__title" }, "Drop atual"),
    h("div", { class: "fields" },
      field("Edição", h("input", { class: "input", value: drop.edition, onInput: (e) => edit((c) => { c.drop.edition = e.target.value; }) })),
      field("Situação", h("select", { class: "input", onChange: (e) => edit((c) => { c.drop.status = e.target.value; }) },
        Object.entries(DROP_STATUS).map(([value, label]) => h("option", { value, selected: value === drop.status }, label)))),
      field("Texto de apoio", h("textarea", { class: "input", rows: 2, onInput: (e) => edit((c) => { c.drop.note = e.target.value; }) }, drop.note))));
}

function productItem(product, index, state, { edit, upload, move, remove }) {
  const set = (apply) => (event) => edit((catalog) => apply(catalog.products[index], event.target));
  const preview = state.previews[product.image] ?? (product.image ? `../${product.image}` : "");

  return h("article", { class: `item${product.active ? "" : " item--hidden"}` },
    preview ? h("img", { class: "thumb", src: preview, alt: "" }) : h("div", { class: "thumb placeholder" }),
    h("div", { class: "fields" },
      field("Nome", h("input", { class: "input", value: product.name, onInput: set((p, el) => { p.name = el.value; }) })),
      field("Preço (R$)", h("input", { class: "input", inputmode: "decimal", placeholder: "0,00", value: product.price == null ? "" : String(product.price).replace(".", ","), onInput: set((p, el) => { p.price = parsePrice(el.value); }) })),
      field("Selo", h("select", { class: "input", onChange: set((p, el) => { p.tag = el.value; }) },
        TAGS.map((tag) => h("option", { value: tag, selected: tag === product.tag }, tag || "Sem selo")))),
      SIZES.map((size) => field(`Estoque ${size}`, h("input", { class: "input", type: "number", min: 0, step: 1, value: product.sizes[size], onInput: set((p, el) => { p.sizes[size] = Math.max(0, Math.floor(Number(el.value)) || 0); }) }))),
      h("label", { class: "check" },
        h("input", { type: "checkbox", checked: product.active, onChange: (e) => edit((c) => { c.products[index].active = e.target.checked; }, { render: true }) }),
        "Visível no site")),
    h("div", { class: "item__actions" },
      h("span", { class: "status" }, `${totalStock(product)} em estoque`),
      h("label", { class: "btn btn--small" }, "Trocar foto", h("input", { class: "visually-hidden", type: "file", accept: "image/*", onChange: (e) => upload(index, e.target.files[0]) })),
      button("↑", () => move(index, -1)),
      button("↓", () => move(index, 1)),
      button("Excluir", () => remove(index))));
}
