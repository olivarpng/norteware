import { renderCatalog } from "./site/catalog.js";
import { initScrollFallback } from "./site/scroll-fallback.js";

renderCatalog().finally(initScrollFallback);
