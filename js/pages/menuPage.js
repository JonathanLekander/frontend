import { getDishes } from "../api/dishApi.js";
import { getCategories } from "../api/categoryApi.js";
import { getDeliveryTypes } from "../api/deliveryApi.js";
import { renderDishes, renderCategories, renderCarrito, renderDeliveryTypes } from "../ui/render.js";
import { addItem, getItems, removeItem, clear } from "../services/carritoService.js";
import { openModal, closeModal } from "../ui/modal.js";
import { mostrarToast } from "../ui/toast.js";
import { createOrder, updateOrder } from "../api/orderApi.js";

let platos = [];
let platoActual = null;
let cantidad = 1;
let textoBusqueda = "";
let categoriaActiva = "all";

document.addEventListener("DOMContentLoaded", init);

function verificarComandaActiva() {
    const comandaNumero = sessionStorage.getItem('comandaActiva');
    
    if (comandaNumero) {
        console.log('Modo: agregando a comanda #' + comandaNumero);
        
       
        const titulo = document.querySelector('nav strong');
        if (titulo) {
            titulo.textContent = `Menú (Comanda #${comandaNumero})`;
        }
        
        const carritoBtn = document.querySelector('.btn-carrito');
        if (carritoBtn && !carritoBtn.querySelector('.comanda-badge')) {
            const badge = document.createElement('span');
            badge.className = 'comanda-badge';
            badge.textContent = `#${comandaNumero}`;
            badge.style.cssText = `
                background: var(--color-terracotta);
                color: white;
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 0.8rem;
                margin-left: 5px;
            `;
            carritoBtn.appendChild(badge);
        }
        
        return comandaNumero;
    }
    
    return null;
}


async function init() {
    try {
        const comandaActiva = verificarComandaActiva();
        
        if (comandaActiva) {
            console.log('Agregando platos a comanda existente #' + comandaActiva);
        }
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
        const matchTexto = p.name.toLowerCase().includes(textoBusqueda);
        const matchCategoria = categoriaActiva === "all" || p.category.id == categoriaActiva;
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

    const notasPlato = document.getElementById("notas-plato").value || "";

    addItem({
        dishId: platoActual.id,
        nombre: platoActual.name,
        precio: platoActual.price,
        cantidad,
        imagen: platoActual.image,
        tipoEntregaId: tipoEntrega,
        notas: notasPlato
    });

    closeModal("dish-detalles");
    renderCarrito(getItems());
    mostrarToast("Agregado al carrito", "success");
    
    document.getElementById("notas-plato").value = "";
}

async function confirmarPedido() {
    const carrito = getItems();

    if (!carrito.length) {
        mostrarToast("El carrito está vacío", "error");
        return;
    }

    const notasGenerales = document.getElementById("notas-generales-pedido")?.value || "";
    
    const comandaActiva = sessionStorage.getItem('comandaActiva');
    
    const itemsParaEnviar = carrito.map(item => ({
        id: item.dishId,
        quantity: item.cantidad,
        notes: item.notas || ""
    }));
    
    const ordenBase = {
        items: itemsParaEnviar,
        delivery: {
            id: carrito[0].tipoEntregaId,
            to: document.getElementById("tipo-entrega-select").selectedOptions[0].text
        },
        notes: notasGenerales
    };

    try {
        let resultado;
        let mensaje = "";
        
        if (comandaActiva) {
            console.log("Actualizando comanda existente #" + comandaActiva);
            
            resultado = await updateOrder(comandaActiva, ordenBase);
            mensaje = `Platos agregados a comanda #${comandaActiva}`;
            
            sessionStorage.removeItem('comandaActiva');
            sessionStorage.removeItem('comandaInfo');
            
            const badge = document.querySelector('.comanda-badge');
            if (badge) badge.remove();
            
            const titulo = document.querySelector('nav strong');
            if (titulo) titulo.textContent = 'Menú';
            
        } else {
            console.log("Creando nueva comanda");
            
            resultado = await createOrder(ordenBase);
            mensaje = "Pedido confirmado";
        }

        mostrarToast(mensaje, "success");

        clear();
        renderCarrito(getItems());

        document.getElementById("notas-generales-pedido").value = "";
        document.getElementById("carrito-modal").style.display = "none";
        
        if (comandaActiva) {
            setTimeout(() => {
                window.location.href = 'comanda.html';
            }, 1500);
        }

    } catch (err) {
        console.error("Error confirmando pedido:", err);
        mostrarToast("Error al confirmar el pedido: " + err.message, "error");
    }
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
            document.getElementById("carrito-modal").style.display = "none";
        });

    document.querySelector(".btn-confirmar-pedido")
        ?.addEventListener("click", confirmarPedido);
}
