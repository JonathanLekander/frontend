export function mostrarDetallesPlato(plato) {
    document.getElementById('detalles-imagen').src = plato.image;
    document.getElementById('detalles-nombre').textContent = plato.name;
    document.getElementById('detalles-descripcion').textContent = plato.description;
    document.getElementById('detalles-precio').textContent = `$${plato.price}`;

    document.getElementById('cantidad-input').value = 1;
    document.getElementById('precio-total').textContent = plato.price;

    abrirModal();
}

function abrirModal() {
    document.getElementById('dish-detalles')
        .classList.add('show');
}

export function cerrarModal() {
    document.getElementById('dish-detalles')
        .classList.remove('show');
}
