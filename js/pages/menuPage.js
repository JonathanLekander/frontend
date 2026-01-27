import { getDishes } from "../api/dishApi.js";
import { getCategories } from "../api/categoryApi.js";
import { getDeliveryTypes } from "../api/deliveryApi.js";
import { renderDishes, renderCategories,  renderCarrito, renderDeliveryTypes } from "../ui/render.js";
import { addItem, getItems, removeItem } from "../services/carritoService.js";
import { openModal, closeModal } from "../ui/modal.js";
import { mostrarToast } from "../ui/toast.js";

let platos = [];
let platoActual = null;
let cantidad = 1;

let textoBusqueda = "";
let categoriaActiva = "all";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    try {
        platos = await getDishes();
        renderDishes(platos, selectDish);

        const categories = await getCategories();
        renderCategories(categories, filterDishes);

        const deliveryTypes = await getDeliveryTypes();
        renderDeliveryTypes(deliveryTypes);

        renderCarrito(getItems());

        initBuscador();
        bindEvents();

    } catch (err) {
        console.error(err);
        mostrarToast("Error cargando el menú", "error");
    }
}

function initBuscador() {
    const input = document.getElementById("search-input");
    if (!input) return;

    input.addEventListener("input", e => {
        textoBusqueda = e.target.value.toLowerCase();
        aplicarFiltros();
    });
}

function filterDishes(e) {
    categoriaActiva = e.target.dataset.category;

    document.querySelectorAll(".filter-btn")
        .forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    aplicarFiltros();
}

function aplicarFiltros() {
    const filtrados = platos.filter(p => {
        const matchTexto =  p.name.toLowerCase().includes(textoBusqueda);
        const matchCategoria =
            categoriaActiva === "all" ||
            p.category.id === Number(categoriaActiva);

        return matchTexto && matchCategoria;
    });

    renderDishes(filtrados, selectDish);
}

function selectDish(dish) {
    platoActual = dish;
    cantidad = 1;

    document.getElementById("detalles-imagen").src = dish.image;
    document.getElementById("detalles-nombre").textContent = dish.name;
    document.getElementById("detalles-descripcion").textContent = dish.description;
    document.getElementById("detalles-precio").textContent = `$${dish.price}`;
    document.getElementById("cantidad-input").value = cantidad;
    document.getElementById("precio-total").textContent = dish.price.toFixed(2);
    document.getElementById("tipo-entrega-select").value = "";
    document.querySelector(".btn-agregar-carrito").onclick = agregarAlCarrito;

    openModal("dish-detalles");
}

function actualizarTotal() {
    const total = platoActual.price * cantidad;
    document.getElementById("precio-total").textContent = total.toFixed(2);
}

function aumentar() {
    cantidad++;
    document.getElementById("cantidad-input").value = cantidad;
    actualizarTotal();
}

function disminuir() {
    if (cantidad > 1) {
        cantidad--;
        document.getElementById("cantidad-input").value = cantidad;
        actualizarTotal();
    }
}

function agregarAlCarrito() {
    if (!platoActual) return;

    const tipoEntrega = document.getElementById("tipo-entrega-select").value;
    if (!tipoEntrega) {
        mostrarToast("Seleccioná un tipo de entrega", "error");
        return;
    }

    addItem({
        dishId: platoActual.id,
        nombre: platoActual.name,
        precio: platoActual.price,
        cantidad,
        imagen: platoActual.image,
        tipoEntregaId: Number(tipoEntrega)
    });

    closeModal("dish-detalles");
    renderCarrito(getItems());
    mostrarToast("Agregado al carrito", "success");
}


function bindEvents() {
    document.querySelector(".btn-aumentar")
        ?.addEventListener("click", aumentar);

    document.querySelector(".btn-disminuir")
        ?.addEventListener("click", disminuir);

    document.querySelector(".btn-cerrar-detalles")
        ?.addEventListener("click", () => closeModal("dish-detalles"));

    document.getElementById("carrito-items")
        ?.addEventListener("click", e => {
            if (e.target.classList.contains("btn-eliminar")) {
                removeItem(Number(e.target.dataset.index));
                renderCarrito(getItems());
            }
        });

    document.querySelector(".btn-carrito")
        ?.addEventListener("click", () => {
            const modal = document.getElementById("carrito-modal");
            modal.style.display =
                modal.style.display === "block" ? "none" : "block";
            renderCarrito(getItems());
        });

    document.querySelector(".btn-cerrar-carrito")
        ?.addEventListener("click", () => {
            document.getElementById("carrito-modal").style.display = "none";});
}
