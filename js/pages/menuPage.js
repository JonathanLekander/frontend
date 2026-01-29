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
        mostrarBotonSalirComanda();
        
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
    filtrarTiposEntregaPorOrigen(); 
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
function mostrarBotonSalirComanda() {
    const btn = document.getElementById('btnSalirComanda');
    if (!btn) return;

    const hayComanda = !!sessionStorage.getItem('comandaActiva');
    btn.style.display = hayComanda ? 'inline-block' : 'none';
}

function filtrarTiposEntregaPorOrigen() {
    const select = document.getElementById("tipo-entrega-select");
    if (!select) return;

    const carrito = getItems();
    const tipoComanda = sessionStorage.getItem('comandaDeliveryTypeId');

    let tipoPermitido = null;

    if (carrito.length > 0) {
        tipoPermitido = String(carrito[0].tipoEntregaId);
    } else if (tipoComanda) {
        tipoPermitido = String(tipoComanda);
    }

    if (!tipoPermitido) {
        [...select.options].forEach(opt => opt.style.display = "");
        return;
    }

    let hayCoincidencia = false;

    [...select.options].forEach(opt => {
        if (!opt.value) return;

        if (String(opt.value) === tipoPermitido) {
            opt.style.display = "";
            hayCoincidencia = true;
        } else {
            opt.style.display = "none";
        }
    });

    if (!hayCoincidencia) {
        console.warn("⚠️ Tipo de entrega no coincide, mostrando todos");
        [...select.options].forEach(opt => opt.style.display = "");
        mostrarToast(
            "No se pudo determinar el tipo de entrega de la comanda",
            "error"
        );
        return;
    }

    select.value = tipoPermitido;
}



function agregarAlCarrito() {
    if (!platoActual) return;

    let tipoEntrega = document.getElementById("tipo-entrega-select").value;

    const tipoComanda = sessionStorage.getItem('comandaDeliveryTypeId');
    if (tipoComanda) {
        tipoEntrega = tipoComanda;
    }

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

    const notasGenerales =
        document.getElementById("notas-generales-pedido")?.value || "";

    const comandaActiva = sessionStorage.getItem("comandaActiva");

    const tipoEntregaId = carrito[0].tipoEntregaId;
    const tipoEntregaTexto =
        document.getElementById("tipo-entrega-select")
            ?.selectedOptions[0]?.text || "Take away";

    const tiposEnCarrito = [...new Set(carrito.map(i => i.tipoEntregaId))];
    if (tiposEnCarrito.length > 1) {
        mostrarToast(
            "Todos los platos deben tener el mismo tipo de entrega",
            "error"
        );
        return;
    }

    const itemsParaEnviar = carrito.map(item => ({
        id: item.dishId,
        quantity: item.cantidad,
        notes: item.notas || ""
    }));

    const ordenBase = {
        items: itemsParaEnviar,
        delivery: {
            id: tipoEntregaId,
            to: tipoEntregaTexto
        },
        notes: notasGenerales
    };

    try {
        if (comandaActiva) {

            await updateOrder(comandaActiva, ordenBase);
            mostrarToast(
                `Platos agregados a comanda #${comandaActiva}`,
                "success"
            );
        } else {
            await createOrder(ordenBase);
            mostrarToast("Nueva comanda creada", "success");
        }

        clear();
        renderCarrito(getItems());
        document.getElementById("notas-generales-pedido").value = "";
        document.getElementById("carrito-modal").style.display = "none";

    } catch (err) {
        console.error("Error confirmando pedido:", err);
        mostrarToast("Error al confirmar el pedido", "error");
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
    
    document.getElementById('btnSalirComanda')
        ?.addEventListener("click", () => {
            sessionStorage.removeItem('comandaActiva');
            sessionStorage.removeItem('comandaDeliveryTypeId');
            window.location.reload();
        });
}
