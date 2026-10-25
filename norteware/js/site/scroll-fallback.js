export function initScrollFallback() {
  if (window.CSS?.supports?.("animation-timeline: view()")) return;

  document.documentElement.classList.add("reveal-fallback");

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
