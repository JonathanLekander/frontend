import { getDishes } from '../api/dishApi.js';
import { getCategories } from '../api/categoryApi.js';
import { cargarCarrito } from '../services/carritoService.js';
import { renderMenu, bindMenuEvents, renderCategorias, bindFiltroEventos, bindSearch} from '../ui/menuUI.js';
import { mostrarToast } from '../ui/toast.js';
import { abrirDetalles } from '../services/dishService.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const platos = await getDishes();
        const categorias = await getCategories();

        renderMenu(platos);
        bindMenuEvents((dishId) => {
        abrirDetalles(dishId, platos);});
        renderCategorias(categorias);
        bindFiltroEventos();
        bindSearch();

        cargarCarrito();
    } catch (e) {
        mostrarToast('Error inicializando menú', 'error');
        console.error(e);
    }
}







