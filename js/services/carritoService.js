const KEY = "carrito";

let carrito = JSON.parse(localStorage.getItem(KEY)) || [];

function save() {
    localStorage.setItem(KEY, JSON.stringify(carrito));
}

export function getItems() {
    return carrito;
}

export function addItem(item) {
    carrito.push(item);
    save();
}

export function removeItem(index) {
    carrito.splice(index, 1);
    save();
}

export function clear() {
    carrito = [];
    localStorage.removeItem(KEY);
}

export function getTotal() {
    return carrito.reduce(
        (acc, i) => acc + i.precio * i.cantidad,
        0
    );
}
