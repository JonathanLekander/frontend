const COMANDA_KEY = "comanda_activa";

export function getComandaActiva() {
    const data = sessionStorage.getItem(COMANDA_KEY);
    return data ? JSON.parse(data) : null;
}

export function setComandaActiva(comanda) {
    sessionStorage.setItem(COMANDA_KEY, JSON.stringify(comanda));
}

export function clearComandaActiva() {
    sessionStorage.removeItem(COMANDA_KEY);
}

export function save(key, value, persistente = true) {
    const storage = persistente ? localStorage : sessionStorage;
    storage.setItem(key, JSON.stringify(value));
}

export function load(key, persistente = true) {
    const storage = persistente ? localStorage : sessionStorage;
    const data = storage.getItem(key);
    return data ? JSON.parse(data) : null;
}

export function remove(key, persistente = true) {
    const storage = persistente ? localStorage : sessionStorage;
    storage.removeItem(key);
}
