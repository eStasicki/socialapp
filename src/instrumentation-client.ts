// Uruchamiane raz, zanim aplikacja stanie się interaktywna (przed hydracją).
// Tylko DEV: rozszerzenia (np. Bitdefender) dopisują do DOM atrybuty `bis_*` / `__processed_*`,
// przez co React zgłasza fałszywe błędy hydracji. Zdejmujemy je i przestajemy obserwować po załadowaniu.
if (process.env.NODE_ENV === "development") {
  const bad = (name: string) => name.startsWith("bis_") || name.startsWith("__processed_");
  const clean = (el: Element) => {
    for (const a of [...el.attributes]) if (bad(a.name)) el.removeAttribute(a.name);
  };
  document.querySelectorAll("*").forEach(clean);
  const observer = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "attributes" && m.attributeName && bad(m.attributeName)) (m.target as Element).removeAttribute(m.attributeName);
      for (const n of m.addedNodes) if (n instanceof Element) { clean(n); n.querySelectorAll("*").forEach(clean); }
    }
  });
  observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  addEventListener("load", () => setTimeout(() => observer.disconnect(), 3000));
}
