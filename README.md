# NORTE WEAR BR

Landing page streetwear da loja [@nortewearbr](https://www.instagram.com/nortewearbr/), com um painel para o dono atualizar drops, preços, tamanhos e estoque sem mexer em código. HTML, CSS e JS puro, sem build.

## Estrutura

```
norteware/
  index.html            marcação semântica
  data/products.json    catálogo: drop atual, peças, preços e estoque por tamanho
  css/                  tokens, base, components, sections, animations
  js/
    main.js             ponto de entrada do site
    shared/             regras e utilitários usados pelo site e pelo painel
    site/               renderização do catálogo e fallback de rolagem
  admin/                painel de gestão (index.html, admin.css, js/)
  assets/               logo, favicon e fotos das peças
  tests/                testes automatizados (node --test)
```

## Como o painel funciona

1. O site lê `data/products.json` e desenha os cards.
2. O painel (`/admin/`) edita esse mesmo arquivo pela API do GitHub. Cada "Salvar" vira um commit.
3. O GitHub Pages republica o site em cerca de 1 minuto.

Não há servidor nem banco de dados. Quem controla o acesso é o GitHub: só quem tem a chave de acesso consegue salvar.


A chave fica só no navegador de quem entrou. Marque "Lembrar neste aparelho" apenas em um aparelho seu.

## Rodar local

```
npm start        # servidor em http://localhost:8080/norteware/
npm test         # testes
```

O site precisa de um servidor local porque lê o `products.json`.

## Personalizar

- **Cores e fontes:** `css/tokens.css`.
- **Endereço do repositório e pastas usadas pelo painel:** `admin/js/config.js` (ajuste `siteRoot` se mover o site para a raiz).
- **Tamanhos e selos disponíveis:** `js/shared/schema.js`.
