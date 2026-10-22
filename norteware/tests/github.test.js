import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createGitHubClient, decodeBase64, encodeBase64 } from "../admin/js/github.js";

const config = { owner: "o", repo: "r", branch: "main", token: "t" };
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const reply = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));

test("base64 preserva acentos", () => {
  assert.equal(decodeBase64(encodeBase64("Boné ✕ Calça")), "Boné ✕ Calça");
});

test("readJson devolve dados e sha", async () => {
  globalThis.fetch = (url) => {
    assert.match(url, /repos\/o\/r\/contents\/a\/b\.json\?ref=main$/);
    return reply({ content: encodeBase64('{"ok":true}'), sha: "abc" });
  };
  const { data, sha } = await createGitHubClient(config).readJson("a/b.json");
  assert.deepEqual(data, { ok: true });
  assert.equal(sha, "abc");
});

test("writeJson envia sha, branch e conteúdo, e devolve o novo sha", async () => {
  let sent;
  globalThis.fetch = (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return reply({ content: { sha: "novo" } });
  };
  const sha = await createGitHubClient(config).writeJson("a.json", { x: "é" }, "velho", "msg");

  assert.equal(sha, "novo");
  assert.equal(sent.options.method, "PUT");
  assert.equal(sent.options.headers.Authorization, "Bearer t");
  assert.equal(sent.body.sha, "velho");
  assert.equal(sent.body.branch, "main");
  assert.deepEqual(JSON.parse(decodeBase64(sent.body.content)), { x: "é" });
});

test("erros do GitHub viram mensagens em português", async () => {
  globalThis.fetch = () => reply({}, 401);
  await assert.rejects(createGitHubClient(config).readJson("a.json"), /inválida ou expirada/);

  globalThis.fetch = () => reply({}, 409);
  await assert.rejects(createGitHubClient(config).writeJson("a.json", {}, "s", "m"), /mudou enquanto/);
});
