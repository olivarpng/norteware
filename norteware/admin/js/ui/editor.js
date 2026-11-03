import { h } from "../../../js/shared/dom.js";
import { formatPhone, parsePrice } from "../../../js/shared/format.js";
import { addSize, DROP_STATUS, digitsOnly, PRODUCT_TYPES, removeSize, setProductType, TAGS, totalStock } from "../../../js/shared/schema.js";
import { field } from "./field.js";

const button = (label, onClick, extra = "") => h("button", { class: `btn btn--small ${extra}`.trim(), type: "button", onClick }, label);
const option = (value, label, selected) => h("option", { value, selected }, label);

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
    storeBox(catalog.store, actions.edit),
    dropBox(catalog.drop, actions.edit),
    h("section", { "aria-label": "Peças" }, catalog.products.map((product, index) => productItem(product, index, state, actions))),
    h("div", { class: "box" }, button("+ Nova peça", actions.add)));
}

function storeBox(store, edit) {
  return h("section", { class: "box" },
    h("h2", { class: "box__title" }, "Loja"),
    h("div", { class: "fields" },
      field("WhatsApp dos pedidos", h("input", {
        class: "input",
        inputmode: "tel",
        value: formatPhone(store.whatsapp),
        onChange: (e) => edit((c) => { c.store.whatsapp = digitsOnly(e.target.value); }, { render: true }),
      }))),
    h("p", { class: "hint" }, "Use 55 + DDD + número. É para esse número que o carrinho do site envia os pedidos."));
}

function dropBox(drop, edit) {
  return h("section", { class: "box" },
    h("h2", { class: "box__title" }, "Drop atual"),
    h("div", { class: "fields" },
      field("Edição", h("input", { class: "input", value: drop.edition, onInput: (e) => edit((c) => { c.drop.edition = e.target.value; }) })),
      field("Situação", h("select", { class: "input", onChange: (e) => edit((c) => { c.drop.status = e.target.value; }) },
        Object.entries(DROP_STATUS).map(([value, label]) => option(value, label, value === drop.status)))),
      field("Texto de apoio", h("textarea", { class: "input", rows: 2, onInput: (e) => edit((c) => { c.drop.note = e.target.value; }) }, drop.note))));
}

function productItem(product, index, state, { edit, upload, move, remove }) {
  const set = (apply) => (event) => edit((catalog) => apply(catalog.products[index], event.target));
  const preview = state.previews[product.image] ?? (product.image ? `../${product.image}` : "");

  const changeType = (event) => {
    const next = event.target.value;
    if (totalStock(product) > 0 && !confirm("Trocar o tipo apaga os tamanhos e o estoque atuais desta peça. Continuar?")) {
      event.target.value = product.type;
      return;
    }
    edit((catalog) => setProductType(catalog.products[index], next), { render: true });
  };

  const newSize = h("input", { class: "input", placeholder: "ex.: 42 ou XG", maxlength: 8 });

  return h("article", { class: `item${product.active ? "" : " item--hidden"}` },
    preview ? h("img", { class: "thumb", src: preview, alt: "" }) : h("div", { class: "thumb placeholder" }),
    h("div", { class: "fields" },
      field("Nome", h("input", { class: "input", value: product.name, onInput: set((p, el) => { p.name = el.value; }) })),
      field("Tipo", h("select", { class: "input", onChange: changeType },
        Object.entries(PRODUCT_TYPES).map(([value, { label }]) => option(value, label, value === product.type)))),
      field("Preço (R$)", h("input", { class: "input", inputmode: "decimal", placeholder: "0,00", value: product.price == null ? "" : String(product.price).replace(".", ","), onInput: set((p, el) => { p.price = parsePrice(el.value); }) })),
      field("Selo", h("select", { class: "input", onChange: set((p, el) => { p.tag = el.value; }) },
        TAGS.map((tag) => option(tag, tag || "Sem selo", tag === product.tag)))),
      h("label", { class: "check" },
        h("input", { type: "checkbox", checked: product.active, onChange: (e) => edit((c) => { c.products[index].active = e.target.checked; }, { render: true }) }),
        "Visível no site")),
    h("div", { class: "sizes-edit" },
      Object.entries(product.sizes).map(([size, qty]) =>
        h("div", { class: "size-edit" },
          field(`Estoque ${size}`, h("input", { class: "input", type: "number", min: 0, step: 1, value: qty, onInput: set((p, el) => { p.sizes[size] = Math.max(0, Math.floor(Number(el.value)) || 0); }) })),
          button("Remover", () => edit((c) => removeSize(c.products[index], size), { render: true }), "btn--ghost"))),
      h("div", { class: "size-edit" },
        field("Novo tamanho", newSize),
        button("Adicionar", () => edit((c) => addSize(c.products[index], newSize.value), { render: true })))),
    h("div", { class: "item__actions" },
      h("span", { class: "status" }, `${totalStock(product)} em estoque`),
      h("label", { class: "btn btn--small" }, "Trocar foto", h("input", { class: "visually-hidden", type: "file", accept: "image/*", onChange: (e) => upload(index, e.target.files[0]) })),
      button("↑", () => move(index, -1)),
      button("↓", () => move(index, 1)),
      button("Excluir", () => remove(index))));
}
