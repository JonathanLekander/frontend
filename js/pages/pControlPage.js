import { getOrders, updateOrderItemStatus } from '../api/orderApi.js';
import { mostrarToast } from '../ui/toast.js';
import { renderComandasControlPanel, renderModalEstado } from '../ui/render.js';

export class PanelControlPage {
    constructor() {
        this.comandas = [];
        this.itemActual = null;
        this.init();
    }

    async init() {
        await this.cargarComandas();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-comanda');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filtrarComandas());
        }

        document.addEventListener('click', (e) => {

            if (e.target.classList.contains('btn-cambiar-estado')) {
                const orderNumber = Number(e.target.dataset.orderNumber);
                const itemId = Number(e.target.dataset.itemId);

                const comanda = this.comandas.find(c => c.orderNumber === orderNumber);
                if (!comanda) return;

                const item = comanda.items?.find(i => i.id === itemId);
                if (!item) return;

                this.abrirModalEstado(comanda, item);
            }

            if (e.target.classList.contains('btn-ver-mas')) {
                const card = e.target.closest('.comanda-card');
                if (!card) return;

                card.classList.toggle('expandida');

                const ocultos = card.querySelectorAll('.item-control').length - 2;

                e.target.textContent = card.classList.contains('expandida')
                    ? 'Ver menos'
                    : `Ver más (${ocultos})`;
            }

            if (e.target.id === 'btn-cancelar-estado') {
                this.cerrarModalEstado();
            }

            if (e.target.id === 'btn-actualizar-estado') {
                this.actualizarEstado();
            }

            if (e.target.id === 'modal-estado') {
                this.cerrarModalEstado();
            }
        });

        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('modal-estado');
            if (e.key === 'Escape' && modal?.style.display === 'block') {
                this.cerrarModalEstado();
            }
        });
    }


    async cargarComandas() {
        try {
            this.comandas = await getOrders();
            this.mostrarComandas(this.comandas);
        } catch (error) {
            console.error('Error cargando comandas:', error);
            this.mostrarError('Error cargando las comandas. Verifica que el backend esté corriendo.');
        }
    }

    mostrarComandas(comandasLista) {
        const container = document.getElementById('comandas-container');
        
        if (!comandasLista || comandasLista.length === 0) {
            container.innerHTML = '<p>No hay comandas encontradas</p>';
            return;
        }

        container.innerHTML = renderComandasControlPanel(comandasLista);
    }

    filtrarComandas() {
        const searchInput = document.getElementById('search-comanda');
        if (!searchInput) return;

        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            this.mostrarComandas(this.comandas);
            return;
        }

        const comandasFiltradas = this.comandas.filter(comanda => 
            comanda.orderNumber.toString().includes(searchTerm)
        );
        
        this.mostrarComandas(comandasFiltradas);
    }

    abrirModalEstado(comanda, item) {
        this.itemActual = {
            orderNumber: comanda.orderNumber,
            itemId: item.id,
            itemNombre: item.dish?.name || 'Plato',
            estadoActual: item.status?.id || 1,
            notas: item.notes || ''
        };

        renderModalEstado(this.itemActual);
        document.getElementById('modal-estado').style.display = 'block';
    }

    cerrarModalEstado() {
        document.getElementById('modal-estado').style.display = 'none';
        this.itemActual = null;
    }

   async actualizarEstado() {
        if (!this.itemActual) return;

        const nuevoEstado = parseInt(document.getElementById('estado-select').value);
        
        try {
            await updateOrderItemStatus(
                this.itemActual.orderNumber, 
                this.itemActual.itemId, 
                { status: nuevoEstado }
            );

            this.cerrarModalEstado();
            mostrarToast('Estado actualizado correctamente', 'success');
            
            await this.cargarComandas();
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            mostrarToast('Error al actualizar el estado', 'error');
        }
    }

    mostrarError(mensaje) {
        const container = document.getElementById('comandas-container');
        if (container) {
            container.innerHTML = `<p class="error">${mensaje}</p>`;
        }
        mostrarToast(mensaje, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PanelControlPage();
});