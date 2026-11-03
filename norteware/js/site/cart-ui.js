import { h } from "../shared/dom.js";
import { addItem, buildMessage, reconcile, removeItem, resolveLines, setQty, totalLabel, totals, validateOrder, whatsappUrl } from "../shared/cart.js";
import { formatPrice } from "../shared/format.js";
import { NO_SIZE } from "../shared/schema.js";
import { loadCart, saveCart } from "./cart-storage.js";

const bagIcon = () =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", width: "20", height: "20" },
    h("path", { d: "M6 7h12l1 13H5L6 7z" }), h("path", { d: "M9 7a3 3 0 0 1 6 0" }));

export function initCart({ products, store }) {
  let items = reconcile(loadCart(), products);

  const count = h("span", { class: "cart-fab__count" });
  const fab = h("button", { class: "cart-fab", type: "button", onClick: () => dialog.showModal() }, bagIcon(), "Carrinho", count);

  const empty = h("p", { class: "cart__empty" }, "Nenhum item ainda. Escolha um tamanho nos cards e clique em Adicionar.");
  const list = h("ul", { class: "cart__lines" });
  const total = h("p", { class: "cart__total" });
  const name = h("input", { class: "input", id: "cart-name", autocomplete: "name", maxlength: 80 });
  const extra = h("textarea", { class: "input", id: "cart-extra", rows: 3, maxlength: 400, placeholder: "ex.: calça M, tênis Vans 41" });
  const status = h("p", { class: "status", role: "status" });

  const dialog = h("dialog", { class: "cart", "aria-labelledby": "cart-title" },
    h("div", { class: "cart__panel" },
      h("header", { class: "cart__header" },
        h("h2", { id: "cart-title" }, "Seu carrinho"),
        h("button", { class: "cart__close", type: "button", "aria-label": "Fechar carrinho", onClick: () => dialog.close() }, "×")),
      h("div", { class: "cart__body" }, empty, list, total,
        h("form", { class: "cart__form", noValidate: true, onSubmit: send },
          h("label", { class: "field", for: "cart-name" }, "Seu nome", name),
          h("div", { class: "field" },
            h("label", { for: "cart-extra", class: "cart__label" }, "Não achou o que procura?"),
            h("p", { class: "cart__help" }, "Tranquilo! Conta pra gente qual produto você quer e trocamos uma ideia pra verificar tudo."),
            extra),
          status,
          h("button", { class: "btn btn--primary", type: "submit" }, "Enviar pelo WhatsApp"),
          h("button", { class: "link cart__clear", type: "button", onClick: clear }, "Esvaziar carrinho")))));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.body.append(fab, dialog);
  render();

  function commit(next) {
    items = next;
    saveCart(items);
    render();
  }

  function render() {
    const lines = resolveLines(items, products);
    const { count: quantity } = totals(lines);

    count.textContent = quantity;
    count.hidden = quantity === 0;
    fab.setAttribute("aria-label", `Abrir carrinho: ${quantity} ${quantity === 1 ? "item" : "itens"}`);
    empty.hidden = lines.length > 0;
    list.replaceChildren(...lines.map(lineItem));
    total.textContent = totalLabel(lines);
    total.hidden = !total.textContent;
  }

  function lineItem({ product, size, qty, subtotal }) {
    const limit = product.sizes[size];
    const stepper = (label, symbol, next, disabled = false) =>
      h("button", { class: "cart__step", type: "button", "aria-label": `${label} ${product.name}`, disabled, onClick: () => commit(setQty(items, product.id, size, next, products)) }, symbol);

    return h("li", { class: "cart__line" },
      h("div", { class: "cart__info" },
        h("strong", {}, product.name),
        size !== NO_SIZE && h("span", { class: "cart__meta" }, `Tamanho ${size}`),
        h("span", { class: "cart__meta" }, subtotal == null ? "Consultar" : formatPrice(subtotal))),
      h("div", { class: "cart__qty" },
        stepper("Diminuir", "−", qty - 1),
        h("span", { "aria-live": "polite" }, String(qty)),
        stepper("Aumentar", "+", qty + 1, qty >= limit)),
      h("button", { class: "cart__remove", type: "button", "aria-label": `Remover ${product.name}`, onClick: () => commit(removeItem(items, product.id, size)) }, "×"));
  }

  function clear() {
    if (items.length && confirm("Esvaziar o carrinho?")) commit([]);
  }

  function send(event) {
    event.preventDefault();
    const order = { name: name.value, lines: resolveLines(items, products), extra: extra.value };
    const problem = validateOrder(order);
    status.textContent = problem ?? "";
    if (problem) return;

    const url = whatsappUrl(store.whatsapp, buildMessage(order));
    if (!window.open(url, "_blank")) window.location.assign(url);
  }

  return {
    add(product, size) {
      const next = addItem(items, product, size);
      if (next === items) return false;
      commit(next);
      return true;
    },
  };
}
