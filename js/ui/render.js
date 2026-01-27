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


