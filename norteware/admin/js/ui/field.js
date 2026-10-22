import { h } from "../../../js/shared/dom.js";

export const field = (label, control) => h("label", { class: "field" }, label, control);
