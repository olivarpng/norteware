export function formatPrice(price) {
  if (price == null) return "Consultar";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parsePrice(text) {
  const raw = String(text).trim().replace(/[^\d.,]/g, "");
  if (!raw) return null;

  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
}
