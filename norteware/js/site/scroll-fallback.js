const root = document.documentElement;

export function initScrollFallback() {
  if (window.CSS?.supports?.("animation-timeline: view()")) return;

  root.classList.add("reveal-fallback");
  revealOnView();
  trackScrollProgress();
}

function revealOnView() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

function trackScrollProgress() {
  const update = () => {
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--progress", max > 0 ? window.scrollY / max : 0);
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
}
