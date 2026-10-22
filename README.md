# NORTE WEAR BR

Landing page streetwear da loja [@nortewearbr](https://www.instagram.com/nortewearbr/). HTML, CSS e um pouco de JS puro, sem build e sem dependências.

## Estrutura

```
index.html          marcação semântica
css/
  tokens.css        cores, fontes, espaçamentos (variáveis)
  base.css          reset, tipografia e utilitários
  components.css    botões, cards, logo, letreiros, tiles
  sections.css      layout de cada seção
  animations.css    keyframes, entrada e animações de rolagem
js/main.js          fallback de rolagem para navegadores sem animation-timeline
assets/             favicon, símbolo da marca e textura de grão
```

## Rodar

Abra o `index.html` no navegador.

## Publicar

GitHub Pages: Settings → Pages → Source: `main` / `(root)`.

## Personalizar

- **Cores e fontes:** edite `css/tokens.css`.
- **Fotos, preços e nomes das peças:** troque os textos entre colchetes (`[FOTO DA PEÇA]`, `[PREÇO]`) em `index.html`.
- **Animações:** `css/animations.css`. Quem ativa "reduzir movimento" no sistema vê a página sem animações.
