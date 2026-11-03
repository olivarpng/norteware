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

export function formatPhone(digits) {
  const match = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  return match ? `+55 ${match[1]} ${match[2]}-${match[3]}` : digits;
}
