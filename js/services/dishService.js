import { mostrarDetallesPlato } from '../ui/dishUI.js';

let platoActual = null;

export function abrirDetalles(platoId, platos) {
    platoActual = platos.find(p => p.id == platoId);

    if (!platoActual) {
        console.error('Plato no encontrado', platoId);
        return;
    }

    mostrarDetallesPlato(platoActual);
}

export function getPlatoActual() {
    return platoActual;
}
