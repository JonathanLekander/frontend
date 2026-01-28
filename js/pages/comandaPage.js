// /js/pages/comandaPage.js
import { getOrders, getOrderById } from '../api/orderApi.js';
import { getDishes } from '../api/dishApi.js';
import { mostrarToast } from '../ui/toast.js';
import { setComandaActiva } from '../services/comandaService.js';

let comandas = [];
let comandaActual = null;
let menuCompleto = [];

// Cargar menú completo
async function cargarMenuCompleto() {
    try {
        const res = await getDishes();
        if (res) {
            menuCompleto = res;
        }
    } catch (error) {
        console.error('Error al cargar menú:', error);
    }
}

// Cargar todas las comandas
async function cargarComandas() {
    mostrarCargando(true);
    
    try {
        await cargarMenuCompleto();
        
        comandas = await getOrders();
        mostrarComandas(comandas);
    } catch (error) {
        mostrarError('No se pudieron cargar las comandas');
    } finally {
        mostrarCargando(false);
    }
}

// Buscar comanda por número
function buscarComanda() {
    const numero = document.getElementById('search-comanda').value.trim();
    
    if (!numero) {
        mostrarComandas(comandas);
        return;
    }
    
    const encontradas = comandas.filter(c => 
        c.orderNumber.toString() === numero
    );
       
    mostrarComandas(encontradas);
}

// Mostrar lista de comandas
function mostrarComandas(lista) {
    const contenedor = document.getElementById('lista-comandas');
    
    if (!lista || lista.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron comandas</p>';
        return;
    }
    
    contenedor.innerHTML = lista.map(c => `
        <div class="comanda-card" onclick="window.verDetallesComanda(${c.orderNumber})">
            <div class="comanda-header">
                <span class="comanda-number">Comanda #${c.orderNumber}</span>
                <span class="comanda-status status-${c.status?.id || 1}">${c.status?.name || 'Pendiente'}</span>
            </div>
            <div class="comanda-info-grid">
                <div class="info-item">
                    <span class="info-label">Total</span>
                    <span class="info-value">$${c.totalAmount || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Items</span>
                    <span class="info-value">${c.items?.length || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Entrega</span>
                    <span class="info-value">${c.deliveryType?.name || 'No especificado'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha</span>
                    <span class="info-value">${formatearFecha(c.createdAt)}</span>
                </div>
            </div>
            <div class="comanda-items-preview">
                <span class="items-count">${c.items?.length || 0} items</span>
            </div>
        </div>
    `).join('');
}

// Ver detalles de una comanda específica
async function verDetallesComanda(orderId) {
    try {
        comandaActual = await getOrderById(orderId);
        mostrarModalComanda(comandaActual);
    } catch (error) {
        mostrarToast('Error al cargar los detalles de la comanda', 'error');
    }
}

// Obtener precio desde el menú
function obtenerPrecioDelMenu(item) {
    if (!menuCompleto.length) {
        return 0;
    }
    
    const platoEnMenu = menuCompleto.find(plato => {
        if (plato.id === item.dishId) return true;
        if (item.dish && plato.id === item.dish.id) return true;
        if (item.dish && plato.name === item.dish.name) return true;
        return false;
    });
    
    return platoEnMenu?.price || 0;
}

// Mostrar modal con detalles
function mostrarModalComanda(comanda) {
    const modal = document.getElementById('modal-comanda');
    modal.style.display = 'block';
    
    document.getElementById('comanda-numero').textContent = comanda.orderNumber;
    document.getElementById('comanda-estado').textContent = comanda.status?.name || 'Pendiente';
    document.getElementById('comanda-total').textContent = `$${comanda.totalAmount || 0}`;
    document.getElementById('comanda-fecha').textContent = formatearFecha(comanda.createdAt);
    document.getElementById('comanda-entrega').textContent = comanda.deliveryType?.name || 'No especificado';
    document.getElementById('comanda-notas').textContent = comanda.notes || 'Sin notas';
    
    const itemsContainer = document.getElementById('comanda-items');
    
    if (comanda.items && comanda.items.length > 0) {
        itemsContainer.innerHTML = comanda.items.map(item => {
            const cantidad = item.quantity || 1;
            
            const precioUnitario = obtenerPrecioDelMenu(item);
            const subtotal = precioUnitario * cantidad;
            
            return `
                <div class="item-detalle">
                    <div class="item-imagen">
                        <img src="${item.dish?.image || 'https://via.placeholder.com/80x80/2c5530/ffffff?text=Plato'}" 
                             alt="${item.dish?.name || 'Plato'}" 
                             onerror="this.src='https://via.placeholder.com/80x80/2c5530/ffffff?text=Plato'">
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.dish?.name || 'Plato no disponible'}</div>
                        <div class="item-details">
                            <span><strong>Precio unitario:</strong> $${precioUnitario.toFixed(2)}</span>
                            ${item.notes ? `<br><span><strong>Notas del plato:</strong> ${item.notes}</span>` : ''}
                            <br><span><strong>Estado:</strong> ${item.status?.name || 'Pendiente'}</span>
                        </div>
                    </div>
                    <div class="item-cantidad">
                        <span class="item-quantity">x${cantidad}</span>
                        <span class="item-price">$${subtotal.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        itemsContainer.innerHTML = '<p>No hay items en esta comanda</p>';
    }
}

// Cerrar modal
function cerrarModalComanda() {
    document.getElementById('modal-comanda').style.display = 'none';
    comandaActual = null;
}

// Agregar más platos a la comanda
function agregarMasPlatos() {
    if (!comandaActual) return;
    
    if (comandaActual.status?.name === 'Closed' || comandaActual.status?.id === 5) {
        mostrarToast('No se pueden agregar platos a una comanda cerrada', 'error');
        return;
    }
    
    setComandaActiva(comandaActual.orderNumber.toString());
    window.location.href = 'menu.html';
}

// Mostrar loading
function mostrarCargando(mostrar) {
    const elemento = document.getElementById('cargando-comandas');
    if (elemento) {
        elemento.style.display = mostrar ? 'block' : 'none';
    }
}

// Mostrar error
function mostrarError(mensaje) {
    const contenedor = document.getElementById('lista-comandas');
    if (contenedor) {
        contenedor.innerHTML = `<p class="error">${mensaje}</p>`;
    }
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';
    
    const f = new Date(fecha);
    f.setHours(f.getHours() - 3);
    
    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const año = f.getFullYear();
    const hora = f.getHours().toString().padStart(2, '0');
    const minuto = f.getMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${hora}:${minuto}`;
}

// Vincular eventos
function bindEvents() {
    // Buscar
    const searchInput = document.getElementById('search-comanda');
    if (searchInput) {
        searchInput.addEventListener('input', buscarComanda);
    }
    
    // Botones del modal
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModalComanda);
    }
    
    const btnAgregarMas = document.querySelector('.btn-principal');
    if (btnAgregarMas) {
        btnAgregarMas.addEventListener('click', agregarMasPlatos);
    }
    
    const btnVolver = document.querySelector('.btn-secundario');
    if (btnVolver) {
        btnVolver.addEventListener('click', cerrarModalComanda);
    }
    
    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', e => {
        if (e.target.id === 'modal-comanda') cerrarModalComanda();
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') cerrarModalComanda();
    });
}

// Inicializar página
function initComandaPage() {
    document.addEventListener('DOMContentLoaded', () => {
        cargarComandas();
        bindEvents();
    });
}

// Hacer funciones disponibles globalmente
window.verDetallesComanda = verDetallesComanda;
window.cerrarModalComanda = cerrarModalComanda;
window.agregarMasPlatos = agregarMasPlatos;

// Inicializar
initComandaPage();

