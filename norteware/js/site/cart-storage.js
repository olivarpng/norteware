const KEY = "norteware.cart";

export function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // armazenamento bloqueado: o carrinho vale só nesta visita
  }
}
