let carrito = [];

export function cargarCarrito() {
    const guardado = localStorage.getItem('carrito');
    carrito = guardado ? JSON.parse(guardado) : [];
    return carrito;
}

export function obtenerCarrito() {
    return carrito;
}

export function agregarItem(item) {
    carrito.push(item);
    guardar();
}

export function eliminarItem(index) {
    carrito.splice(index, 1);
    guardar();
}

export function vaciarCarrito() {
    carrito = [];
    guardar();
}

export function calcularTotal() {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function guardar() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}
