import { getOrders, getOrderById } from '../api/orderApi.js';
import { getDishes } from '../api/dishApi.js';
import { mostrarToast } from '../ui/toast.js';
import { setComandaActiva } from '../services/comandaService.js';
import { renderComandas, renderDetallesComanda } from '../ui/render.js';

export class ComandaPage {
    constructor() {
        this.comandas = [];
        this.comandaActual = null;
        this.menuCompleto = [];
        this.init();
    }

    async init() {
        await this.cargarMenuCompleto();
        await this.cargarComandas();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-comanda');
        if (searchInput) searchInput.addEventListener('input', () => this.buscarComanda());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-principal')) this.agregarMasPlatos();
            if (e.target.classList.contains('btn-secundario')) this.cerrarModalComanda();
            if (e.target.id === 'modal-comanda') this.cerrarModalComanda();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('modal-comanda').style.display === 'block') {
                this.cerrarModalComanda();
            }
        });
    }

    async cargarMenuCompleto() {
        try {
            const res = await getDishes();
            if (res) this.menuCompleto = res;
        } catch (error) {
            console.error('Error al cargar menú:', error);
        }
    }

    async cargarComandas() {
        this.mostrarCargando(true);
        try {
            this.comandas = await getOrders();
            this.mostrarComandas(this.comandas);
        } catch (error) {
            this.mostrarError('No se pudieron cargar las comandas');
        } finally {
            this.mostrarCargando(false);
        }
    }

    buscarComanda() {
        const numero = document.getElementById('search-comanda').value.trim();
        if (!numero) return this.mostrarComandas(this.comandas);

        const encontradas = this.comandas.filter(c => c.orderNumber.toString() === numero);
        this.mostrarComandas(encontradas);
    }
 
    
    mostrarComandas(lista) {
        const contenedor = document.getElementById('lista-comandas');
        if (!lista || lista.length === 0) {
            contenedor.innerHTML = '<p>No se encontraron comandas</p>';
            return;
        }

        contenedor.innerHTML = renderComandas(lista);
        document.querySelectorAll('.comanda-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const orderId = card.dataset.orderId;
                if (orderId) this.verDetallesComanda(parseInt(orderId));
            });
        });
    }

    obtenerPrecioDelMenu(item) {
        if (!this.menuCompleto.length) return item.price || 0;

        const platoEnMenu = this.menuCompleto.find(plato => {
            if (plato.id === item.dishId) return true;
            if (item.dish && plato.id === item.dish.id) return true;
            if (item.dish && plato.name === item.dish.name) return true;
            return false;
        });

        return platoEnMenu?.price || item.price || 0;
    }

    async verDetallesComanda(orderId) {
        try {
            this.comandaActual = await getOrderById(orderId);
            this.mostrarModalComanda(this.comandaActual);
        } catch (error) {
            mostrarToast('Error al cargar los detalles de la comanda', 'error');
        }
    }

    mostrarModalComanda(comanda) {
        const modal = document.getElementById('modal-comanda');
        if (!modal) return;
        modal.style.display = 'block';

        // Mostrar botón "Agregar más platos" solo si la comanda no está cerrada
        const btnAgregar = document.getElementById('btn-agregar-platos');
        if (comanda.status?.name === 'Closed' || comanda.status?.id === 5) {
            btnAgregar.style.display = 'none';
        } else {
            btnAgregar.style.display = 'inline-block';
        }

        renderDetallesComanda(comanda, this.obtenerPrecioDelMenu.bind(this));
    }

    cerrarModalComanda() {
        const modal = document.getElementById('modal-comanda');
        if (modal) modal.style.display = 'none';
        this.comandaActual = null;
    }

    agregarMasPlatos() {
        if (!this.comandaActual) {
            mostrarToast('No hay comanda seleccionada', 'error');
            return;
        }

        if (this.comandaActual.status?.name === 'Closed' || this.comandaActual.status?.id === 5) {
            mostrarToast('No se pueden agregar platos a una comanda cerrada', 'error');
            return;
        }

        // Guardar la comanda completa para el menú
        setComandaActiva(this.comandaActual);
        window.location.href = 'menu.html';
    }

    mostrarCargando(mostrar) {
        const elemento = document.getElementById('cargando-comandas');
        const lista = document.getElementById('lista-comandas');
        if (elemento) elemento.style.display = mostrar ? 'block' : 'none';
        if (lista && mostrar) lista.innerHTML = '';
    }

    mostrarError(mensaje) {
        const contenedor = document.getElementById('lista-comandas');
        if (contenedor) contenedor.innerHTML = `<p class="error">${mensaje}</p>`;
        mostrarToast(mensaje, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ComandaPage();
});
