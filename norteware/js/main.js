import { initCarousel } from "./site/carousel.js";
import { initCart } from "./site/cart-ui.js";
import { loadCatalog, renderCatalog } from "./site/catalog.js";
import { initScrollFallback } from "./site/scroll-fallback.js";

initCarousel();
start();

async function start() {
  const catalog = await loadCatalog();
  const cart = catalog ? initCart(catalog) : null;

  renderCatalog(catalog, { onAdd: cart?.add });
  initScrollFallback();
}
