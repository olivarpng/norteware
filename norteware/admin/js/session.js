const KEY = "norteware.admin";

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

export function saveSession(token, remember) {
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify({ token, remember }));
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}
