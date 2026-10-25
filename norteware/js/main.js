import { initCarousel } from "./site/carousel.js";
import { renderCatalog } from "./site/catalog.js";
import { initScrollFallback } from "./site/scroll-fallback.js";

initCarousel();
renderCatalog().finally(initScrollFallback);
