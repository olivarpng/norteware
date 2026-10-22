import { h } from "../../js/shared/dom.js";
import { createProduct, normalizeCatalog, validateCatalog } from "../../js/shared/schema.js";
import { CONFIG, repoPath } from "./config.js";
import { createGitHubClient } from "./github.js";
import { resizeToJpeg } from "./image.js";
import { clearSession, loadSession, saveSession } from "./session.js";
import { createStore } from "./store.js";
import { renderEditor } from "./ui/editor.js";
import { renderLogin } from "./ui/login.js";

const root = document.querySelector("#app");
const store = createStore({ view: "login", client: null, catalog: null, sha: null, dirty: false, busy: false, message: "", previews: {} });

const actions = {
  edit: (mutator, options) => update(mutator, options),
  add: () => update((catalog) => catalog.products.push(createProduct(catalog.products)), { render: true }),
  move: (index, step) => update((catalog) => swap(catalog.products, index, index + step), { render: true }),
  remove(index) {
    const { name } = store.get().catalog.products[index];
    if (confirm(`Excluir "${name || "peça sem nome"}"?`)) update((catalog) => catalog.products.splice(index, 1), { render: true });
  },
  async upload(index, file) {
    if (!file) return;
    const { client, catalog } = store.get();
    const product = catalog.products[index];
    await run("Enviando foto…", async () => {
      const { base64, previewUrl } = await resizeToJpeg(file);
      const webPath = `${CONFIG.imageDir}/${product.id}-${Date.now()}.jpg`;
      await client.uploadFile(repoPath(webPath), base64, `Adiciona foto de ${product.name}`);
      update((c) => { c.products[index].image = webPath; });
      store.set({ previews: { ...store.get().previews, [webPath]: previewUrl } });
      return "Foto enviada. Clique em Salvar para publicar.";
    });
  },
  async save() {
    const { client, catalog, sha } = store.get();
    const errors = validateCatalog(catalog);
    if (errors.length) return store.set({ message: errors.join(" ") });

    await run("Salvando…", async () => {
      const newSha = await client.writeJson(repoPath(CONFIG.dataFile), catalog, sha, "Atualiza catálogo pelo painel");
      store.set({ sha: newSha, dirty: false });
      return "Salvo! O site atualiza em cerca de 1 minuto.";
    });
  },
  logout() {
    clearSession();
    store.set({ view: "login", client: null, catalog: null, dirty: false, message: "" });
  },
};

function swap(list, from, to) {
  if (to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
}

function update(mutator, { render = false } = {}) {
  const catalog = structuredClone(store.get().catalog);
  mutator(catalog);
  store.set({ catalog, dirty: true, message: "" }, { silent: !render });
  if (!render) syncSaveButton();
}

function syncSaveButton() {
  const { dirty, busy } = store.get();
  root.querySelector("[data-save]")?.toggleAttribute("disabled", !dirty || busy);
}

async function run(busyMessage, task) {
  store.set({ busy: true, message: busyMessage });
  try {
    store.set({ message: await task(), busy: false });
  } catch (error) {
    store.set({ message: error.message, busy: false });
  }
}

async function connect(token, remember) {
  store.set({ busy: true, message: "" });
  const client = createGitHubClient({ ...CONFIG, token });
  try {
    const { data, sha } = await client.readJson(repoPath(CONFIG.dataFile));
    saveSession(token, remember);
    store.set({ view: "editor", client, sha, catalog: normalizeCatalog(data), dirty: false, busy: false, message: "" });
  } catch (error) {
    clearSession();
    store.set({ view: "login", busy: false, message: error.message });
  }
}

function render(state) {
  root.replaceChildren(
    state.view === "editor"
      ? renderEditor(state, actions)
      : renderLogin({ onSubmit: connect, message: state.message, busy: state.busy })
  );
}

window.addEventListener("beforeunload", (event) => {
  if (store.get().dirty) event.preventDefault();
});

store.subscribe(render);
const saved = loadSession();
saved ? connect(saved.token, saved.remember) : render(store.get());
