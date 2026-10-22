import { h } from "../../../js/shared/dom.js";
import { field } from "./field.js";

export function renderLogin({ onSubmit, message, busy }) {
  const token = h("input", { class: "input", type: "password", autocomplete: "off", required: true, placeholder: "github_pat_..." });
  const remember = h("input", { type: "checkbox" });

  return h("main", { class: "login" },
    h("h1", { class: "topbar__title" }, "Painel Norte"),
    h("p", { class: "section__note" }, "Entre com a chave de acesso do GitHub para editar drops, tamanhos e estoque."),
    h("form", { class: "box", onSubmit: (event) => { event.preventDefault(); onSubmit(token.value.trim(), remember.checked); } },
      field("Chave de acesso", token),
      h("label", { class: "check" }, remember, "Lembrar neste aparelho"),
      h("p", { class: "status", role: "status" }, message),
      h("button", { class: "btn btn--primary", type: "submit", disabled: busy }, busy ? "Entrando…" : "Entrar")),
    h("ol", { class: "steps" },
      h("li", {}, "Abra ", h("a", { class: "accent", href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener" }, "github.com/settings/personal-access-tokens/new")),
      h("li", {}, "Em Repository access, escolha só o repositório norteware."),
      h("li", {}, "Em Permissions, marque Contents: Read and write."),
      h("li", {}, "Defina a validade, gere e cole a chave aqui.")));
}
