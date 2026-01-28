export function renderDishes(platos, onSelect) {
    console.log("Render platos:", platos);

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
    console.log("Render categorías:", categories);

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
