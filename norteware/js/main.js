(() => {
  const root = document.documentElement;
  const hasScrollTimeline = window.CSS?.supports?.("animation-timeline: view()");

  if (hasScrollTimeline) return;

  root.classList.add("reveal-fallback");
  revealOnView();
  trackScrollProgress();

  function revealOnView() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
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
})();
