export function renderDishes(platos, onSelect) {


    const container = document.getElementById("menu-container");
    container.innerHTML = "";

    platos.forEach(dish => {
        const activo =
            dish.available === true ||
            dish.Available === true ||
            dish.isActive === true;

        if (!activo) return;

        const card = document.createElement("div");
        card.className = "dish-card";
        card.dataset.category = dish.category.id;

        card.innerHTML = `
            <img src="${dish.image}" class="dish-img">
            <h3>${dish.name}</h3>
            <p>${dish.description.substring(0, 100)}...</p>
            <span class="price">$${dish.price}</span>
        `;

        card.querySelector("img")
            .addEventListener("click", () => onSelect(dish));

        container.appendChild(card);
    });
}

export function renderCategories(categories, onFilter) {
    
    const container = document.getElementById("filter-buttons");
    container.innerHTML =
        `<button class="filter-btn active" data-category="all">Todos</button>`;

    categories.forEach(cat => {
        container.innerHTML +=
            `<button class="filter-btn" data-category="${cat.id}">${cat.name}</button>`;
    });

    container.querySelectorAll(".filter-btn")
        .forEach(btn => btn.addEventListener("click", onFilter));
}

export function renderDeliveryTypes(tipos) {
    const select = document.getElementById("tipo-entrega-select");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccionar tipo de entrega</option>`;

    tipos.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name;
        select.appendChild(opt);
    });
}

export function renderCarrito(carrito) {
    const cont = document.getElementById("carrito-items");
    const totalEl = document.getElementById("carrito-total");

    if (!carrito.length) {
        cont.innerHTML = "<p class='carrito-vacio'>El carrito está vacío</p>";
        totalEl.textContent = "0";
        return;
    }

    let total = 0;

    cont.innerHTML = carrito.map((item, index) => {
        total += item.precio * item.cantidad;

        return `
            <div class="carrito-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <div class="item-detalles">
                        Cantidad: ${item.cantidad}
                    </div>
                    <div class="item-precio">
                        $${item.precio} c/u
                    </div>
                </div>
                <button class="btn-eliminar" data-index="${index}">×</button>
            </div>
        `;
    }).join("");

    totalEl.textContent = total.toFixed(2);
}

/*===========================================*/
export function renderComandas(comandas, onVerDetalles) {
    return comandas.map(c => `
        <div class="comanda-card" data-order-id="${c.orderNumber}">
            <div class="comanda-header">
                <span class="comanda-number">Comanda #${c.orderNumber}</span>
                <span class="comanda-status status-${c.status?.id || 1}">
                    ${c.status?.name || 'Pendiente'}
                </span>
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

export function formatearFecha(fecha) {
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


export function renderDetallesComanda(comanda, obtenerPrecioUnitario) {
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
            const precioUnitario = obtenerPrecioUnitario(item);
            const subtotal = precioUnitario * cantidad;

            const notasHTML = item.notes ? 
                `<br><span><strong>Notas del plato:</strong> ${item.notes}</span>` : 
                '';

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
                            ${notasHTML}
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

// ================= FUNCIONES PARA PANEL DE CONTROL =================

export function renderComandasControlPanel(comandasLista) {
    return comandasLista.map(comanda => {
        const fechaFormateada = formatearFecha(comanda.createdAt);
        const itemsCount = comanda.items?.length || 0;

        const itemsHTML = (comanda.items || []).map(item => {
            const precio =
                item.price ??
                item.unitPrice ??
                item.subtotal ??
                item.dish?.price ??
                null;

            return `
                <div class="item-control">
                    <div class="item-imagen">
                        <img src="${item.dish?.image || 'https://via.placeholder.com/50x50'}">
                    </div>

                    <div class="item-info">
                        <div class="item-name">
                            ${item.dish?.name || 'Plato'} x${item.quantity || 1}
                        </div>

                        <div class="item-detalle">
                            <strong>Estado:</strong> ${item.status?.name || 'Pendiente'}
                        </div>

                        ${item.notes ? `
                            <div class="item-detalle">
                                <strong>Notas:</strong> ${item.notes}
                            </div>
                        ` : ''}

                        ${precio !== null ? `
                            <div class="item-detalle">
                                <strong>Precio:</strong> $${precio}
                            </div>
                        ` : ''}
                    </div>

                    <button class="btn-cambiar-estado"
                        data-order-number="${comanda.orderNumber}"
                        data-item-id="${item.id}">
                        Cambiar Estado
                    </button>
                </div>
            `;
        }).join('');

        const verMasHTML = itemsCount > 2 ? `
            <button class="btn-ver-mas">
                Ver más (${itemsCount - 2})
            </button>
        ` : '';

        return `
            <div class="comanda-card">
                <div class="comanda-header">
                    <span class="comanda-number">
                        Comanda #${comanda.orderNumber}
                    </span>

                    <span class="comanda-status status-${comanda.status?.id || 1}">
                        ${comanda.status?.name || 'Pendiente'}
                    </span>
                </div>

                <div class="comanda-info">
                    <div>Total: $${comanda.totalAmount || 0}</div>
                    <div>Entrega: ${comanda.deliveryType?.name || 'N/A'}</div>
                    <div>Fecha: ${fechaFormateada}</div>
                    <div>Items: ${itemsCount}</div>
                </div>

                <div class="comanda-items">
                    ${itemsHTML}
                </div>

                ${verMasHTML}
            </div>
        `;
    }).join('');
}



export function renderModalEstado(itemData) {
    document.getElementById('modal-item-nombre').textContent = itemData.itemNombre;
    document.getElementById('modal-comanda-numero').textContent = itemData.orderNumber;
    document.getElementById('modal-item-notas').textContent = itemData.notas || 'Sin notas';
    document.getElementById('modal-estado-actual').textContent = obtenerNombreEstado(itemData.estadoActual);
    
    const select = document.getElementById('estado-select');
    if (select) {
        select.value = itemData.estadoActual;
    }
}

export function obtenerNombreEstado(id) {
    const estados = {
        1: 'Pending',
        2: 'In Progress', 
        3: 'Ready',
        4: 'Delivery',
        5: 'Closed'
    };
 return estados[id] || 'Desconocido';
}