const API = "https://api.github.com";

const ERROR_MESSAGES = {
  401: "Chave inválida ou expirada. Gere uma nova no GitHub.",
  403: "Sem permissão. A chave precisa de Contents: Read and write.",
  404: "Repositório ou arquivo não encontrado. Confira se a chave tem acesso ao repositório.",
  409: "O catálogo mudou enquanto você editava. Recarregue a página e refaça a alteração.",
  422: "O catálogo mudou enquanto você editava. Recarregue a página e refaça a alteração.",
};

export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

export function decodeBase64(base64) {
  const binary = atob(base64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function createGitHubClient({ owner, repo, branch, token }) {
  const endpoint = (path) => `${API}/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;

  async function request(url, options = {}) {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...options.headers,
        },
      });
    } catch {
      throw new GitHubError("Sem conexão com o GitHub. Verifique a internet.", 0);
    }

    if (!response.ok) {
      throw new GitHubError(ERROR_MESSAGES[response.status] ?? `Erro do GitHub (${response.status}).`, response.status);
    }
    return response.json();
  }

  const put = (path, body) =>
    request(endpoint(path), { method: "PUT", body: JSON.stringify({ ...body, branch }) });

  return {
    async readJson(path) {
      const file = await request(`${endpoint(path)}?ref=${encodeURIComponent(branch)}`);
      return { data: JSON.parse(decodeBase64(file.content)), sha: file.sha };
    },

    async writeJson(path, data, sha, message) {
      const result = await put(path, { message, sha, content: encodeBase64(`${JSON.stringify(data, null, 2)}\n`) });
      return result.content.sha;
    },

    async uploadFile(path, base64, message) {
      await put(path, { message, content: base64 });
    },
  };
}
