let comandas = [];
let itemActual = null;

async function cargarComandas() {
    try {
        const response = await fetch('https://localhost:7266/api/v1/Order');
        if (!response.ok) throw new Error('Error en la respuesta');
        
        comandas = await response.json();
        mostrarComandas(comandas);
    } catch (error) {
        console.error('Error cargando comandas:', error);
        document.getElementById('comandas-container').innerHTML = 
            '<p>Error cargando las comandas. Verifica que el backend esté corriendo.</p>';
    }
}

function mostrarComandas(comandasLista) {
    const container = document.getElementById('comandas-container');
    container.innerHTML = '';

    if (!comandasLista || comandasLista.length === 0) {
        container.innerHTML = '<p>No hay comandas encontradas</p>';
        return;
    }

    comandasLista.forEach(comanda => {
        const comandaCard = `
            <div class="comanda-card">
                <div class="comanda-header">
                    <span class="comanda-number">Comanda #${comanda.orderNumber}</span>
                    <span class="comanda-status status-${comanda.status.id}">${comanda.status.name}</span>
                </div>
                
                <div class="comanda-info">
                    <div class="info-item">
                        <span class="info-label">Total:</span>
                        <span>$${comanda.totalAmount}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Entrega:</span>
                        <span>${comanda.deliveryType.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha:</span>
                        <span>${formatearFecha(comanda.createdAt)}</span>
                    </div>
                    ${comanda.notes ? `
                    <div class="info-item">
                        <span class="info-label">Notas:</span>
                        <span>${comanda.notes}</span>
                    </div>` : ''}
                </div>

                <div class="comanda-items">
                    <h4>Items del Pedido:</h4>
                    ${comanda.items.map(item => `
                        <div class="item-control">
                            <div class="item-imagen">
                                <img src="${item.dish.image}" alt="${item.dish.name}">
                            </div>
                            <div class="item-info">
                                <div class="item-name">${item.dish.name} x${item.quantity}</div>
                                <div class="item-estado-actual">Estado: ${item.status.name}</div>
                                ${item.notes ? `<div class="item-notes">Notas: ${item.notes}</div>` : ''}
                            </div>
                            <button class="btn-cambiar-estado" 
                                    onclick="abrirModalEstado(${comanda.orderNumber}, ${item.id}, '${item.dish.name}', ${item.status.id}, '${item.notes || ''}')">
                                Cambiar Estado
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML += comandaCard;
    });
}

function abrirModalEstado(orderNumber, itemId, itemNombre, estadoActual, notas) {
    itemActual = {
        orderNumber: orderNumber,
        itemId: itemId,
        itemNombre: itemNombre,
        estadoActual: estadoActual,
        notas: notas
    };

    document.getElementById('modal-item-nombre').textContent = itemNombre;
    document.getElementById('modal-comanda-numero').textContent = orderNumber;
    document.getElementById('modal-item-notas').textContent = notas || 'Sin notas';
    document.getElementById('modal-estado-actual').textContent = obtenerNombreEstado(estadoActual);
    document.getElementById('estado-select').value = estadoActual;

    document.getElementById('modal-estado').style.display = 'block';
}

function cerrarModalEstado() {
    document.getElementById('modal-estado').style.display = 'none';
    itemActual = null;
}

async function actualizarEstado() {
    if (!itemActual) return;

    const nuevoEstado = parseInt(document.getElementById('estado-select').value);
    
    try {
        const response = await fetch(`https://localhost:7266/api/v1/Order/${itemActual.orderNumber}/items/${itemActual.itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: nuevoEstado
            })
        });

        if (!response.ok) throw new Error('Error al actualizar el estado');

        cerrarModalEstado();
        
        mostrarToast('Estado actualizado correctamente');
        
        await cargarComandas();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error al actualizar el estado', 'error');
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000); 
}
function obtenerNombreEstado(id) {
    const estados = {
        1: 'Pending',
        2: 'In Progress', 
        3: 'Ready',
        4: 'Delivery',
        5: 'Closed'
    };
    return estados[id] || 'Desconocido';
}

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

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


function setupSearch() {
    const searchInput = document.getElementById('search-comanda');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        
        if (!searchTerm) {
            mostrarComandas(comandas);
            return;
        }

        const comandasFiltradas = comandas.filter(comanda => 
            comanda.orderNumber.toString() === searchTerm
        );
        
        mostrarComandas(comandasFiltradas);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarComandas();
    setupSearch();
});