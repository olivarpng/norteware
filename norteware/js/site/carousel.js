import { h } from "../shared/dom.js";

const AUTOPLAY_MS = 5000;

export function initCarousel(root = document.querySelector(".carousel")) {
  if (!root) return;

  const track = root.querySelector(".carousel__track");
  const slides = [...track.children];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = null;
  let autoplay = !reduceMotion && slides.length > 1;

  const dots = slides.map((_, i) =>
    h("button", { class: "carousel__dot", type: "button", "aria-label": `Ir para o slide ${i + 1}`, onClick: () => manual(() => goTo(i)) })
  );
  root.querySelector(".carousel__dots").append(...dots);

  root.querySelectorAll("[data-dir]").forEach((btn) =>
    btn.addEventListener("click", () => manual(() => goTo(index + Number(btn.dataset.dir))))
  );

  track.addEventListener("scroll", () => {
    index = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
  }, { passive: true });

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") manual(() => goTo(index + 1));
    if (event.key === "ArrowLeft") manual(() => goTo(index - 1));
  });

  ["pointerenter", "focusin"].forEach((type) => root.addEventListener(type, stop));
  ["pointerleave", "focusout"].forEach((type) => root.addEventListener(type, start));
  root.addEventListener("touchstart", () => manual(() => {}), { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  dots[0].setAttribute("aria-current", "true");
  start();

  function goTo(target) {
    const next = (target + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function manual(action) {
    autoplay = false;
    stop();
    action();
  }

  function start() {
    if (!autoplay || timer) return;
    timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }
}
