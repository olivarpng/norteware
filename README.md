# NORTE WEAR BR

Landing page streetwear da loja [@nortewearbr](https://www.instagram.com/nortewearbr/), com um painel para o dono atualizar drops, preços, tamanhos e estoque sem mexer em código. HTML, CSS e JS puro, sem build.

## Estrutura

```
norteware/
  index.html            marcação semântica
  data/products.json    catálogo: drop atual, peças, preços e estoque por tamanho
  css/                  tokens, base, components, cart, sections, animations
  js/
    main.js             ponto de entrada do site
    shared/             regras puras (catálogo, carrinho, formatação), usadas pelo site e pelo painel
    site/               cards, carrinho, carrossel e fallback de rolagem
  admin/                painel de gestão (index.html, admin.css, js/)
  assets/               logo, favicon e fotos das peças
  tests/                testes automatizados (node --test)
```

## Como o painel funciona

1. O site lê `data/products.json` e desenha os cards.
2. O painel (`/admin/`) edita esse mesmo arquivo pela API do GitHub. Cada "Salvar" vira um commit.
3. O GitHub Pages republica o site em cerca de 1 minuto.

Não há servidor nem banco de dados. Quem controla o acesso é o GitHub: só quem tem a chave de acesso consegue salvar. A chave fica só no navegador de quem entrou, então marque "Lembrar neste aparelho" apenas em um aparelho seu.

## Tipos de peça e tamanhos

Cada peça tem um **tipo**, que define a lista de tamanhos:

| Tipo | Tamanhos iniciais |
|---|---|
| Roupa | P, M, G, GG |
| Calçado | 36 a 44 |
| Único | sem tamanho (boné, acessório) |

No painel dá para remover tamanhos que a loja não trabalha e adicionar outros (XG, 45, 42,5). Trocar o tipo de uma peça recomeça a lista de tamanhos e o estoque dela.

## Carrinho e pedidos

O cliente escolhe o tamanho no card, clica em **Adicionar** e envia o pedido pelo WhatsApp, já com a mensagem pronta (nome, itens, total e, se quiser, "outros itens ou dúvidas"). O número que recebe os pedidos é editado no painel, no bloco **Loja**.

O site não sabe quando um pedido é fechado, então **o estoque não baixa sozinho**: depois de confirmar a venda no WhatsApp, atualize o estoque no painel.

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
