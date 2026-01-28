const COMANDA_ACTIVA_KEY = 'comandaActiva';

export function getComandaActiva() {
    return sessionStorage.getItem(COMANDA_ACTIVA_KEY);
}

export function setComandaActiva(orderNumber) {
    sessionStorage.setItem(COMANDA_ACTIVA_KEY, orderNumber.toString());
}

export function clearComandaActiva() {
    sessionStorage.removeItem(COMANDA_ACTIVA_KEY);
}

export function puedeAgregarPlatos(comanda) {
    if (!comanda) return false;
    
    return comanda.status?.name !== 'Closed' && comanda.status?.id !== 5;
}