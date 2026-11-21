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

## Fundo de fumaça

O fundo animado de fumaça roxa é desenhado na hora pelo navegador (WebGL), sem vídeo nem imagem: `js/site/smoke.js` controla o canvas e `js/site/smoke-shader.js` tem o efeito. Ele roda em resolução reduzida e a 30 quadros por segundo, pausa quando a aba fica escondida e vira uma imagem parada para quem ativa "reduzir movimento". Em aparelhos sem WebGL entra um fundo roxo estático no lugar. Para ajustar o brilho ou a velocidade, edite o final do `smoke-shader.js` (cores e intensidade) e `SPEED` em `smoke.js`.

## Categorias (abas)

O drop é dividido em abas: **Todos, Calçados, Calças / Shorts, Camisetas e Moletom**. Cada peça tem uma **categoria** no painel, e é ela que decide em qual aba a peça aparece. Escolher uma categoria já usa a lista de tamanhos certa (calçado usa numeração, as demais usam P a GG). A aba **Outros** só aparece se existir alguma peça nessa categoria. Peças antigas sem categoria são encaixadas pelo nome (por exemplo, "Tênis..." vai para Calçados) até serem salvas de novo no painel.

## Catálogo completo (Drive)

Abaixo do drop há um botão **Ver catálogo completo**, e o carrinho tem o mesmo link no campo "Não achou o que procura?". O endereço fica no painel, no bloco **Loja**, e só aceita links `https://`. Deixando o campo vazio, os botões somem. A pasta do Drive deve ficar compartilhada como "qualquer pessoa com o link", só para visualização.

## Carrinho e pedidos

O cliente escolhe o tamanho no card, clica em **Adicionar** e envia o pedido pelo WhatsApp, já com a mensagem pronta (nome, itens, total e, se quiser, "outros itens ou dúvidas"). O número que recebe os pedidos é editado no painel, no bloco **Loja**.

O site não sabe quando um pedido é fechado, então **o estoque não baixa sozinho**: depois de confirmar a venda no WhatsApp, atualize o estoque no painel.

## Rodar local

```
npm start        # servidor em http://localhost:8080/norteware/
npm test         # testes
```

O site precisa de um servidor local porque lê o `products.json`.

## Ferramenta de design (Claude Code)

A pasta `.claude/skills/ui-ux-pro-max/` tem o UI/UX Pro Max, uma base de consulta de estilos, paletas, fontes e boas práticas de UX que o Claude Code usa ao mexer na interface. Ela não faz parte do site e não é publicada. Para usar: abra o projeto no Claude Code (precisa de Python 3), reinicie-o e peça mudanças de visual normalmente. Para atualizar, rode `npx uipro-cli update --ai claude`; para remover, apague a pasta.

## Personalizar

- **Cores e fontes:** `css/tokens.css`.
- **Endereço do repositório e pastas usadas pelo painel:** `admin/js/config.js` (ajuste `siteRoot` se mover o site para a raiz).
- **Tamanhos e selos disponíveis:** `js/shared/schema.js`.
