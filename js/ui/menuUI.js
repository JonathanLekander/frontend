export function renderMenu(dishes) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';

    const platosDisponibles = dishes.filter(dish =>
        dish.available === true ||
        dish.Available === true ||
        dish.isActive === true
    );

    if (platosDisponibles.length === 0) {
        menuContainer.innerHTML = '<p>No hay platos disponibles en este momento</p>';
        return;
    }

    platosDisponibles.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.dataset.category = dish.category.id;

        card.innerHTML = `
            <img src="${dish.image}" class="dish-img" data-id="${dish.id}" style="cursor:pointer">
            <h3>${dish.name}</h3>
            <p>${dish.description.substring(0, 100)}...</p>
            <span class="price">$${dish.price}</span>
        `;

        menuContainer.appendChild(card);
    });
}

export function bindMenuEvents(onDishClick) {
    document.querySelectorAll('.dish-img').forEach(img => {
        img.addEventListener('click', () => {
            onDishClick(img.dataset.id);
        });
    });
}

export function renderCategorias(categorias) {
    const container = document.getElementById('filter-buttons');
    container.innerHTML = '';

    const btnTodos = document.createElement('button');
    btnTodos.className = 'filter-btn active';
    btnTodos.dataset.category = 'all';
    btnTodos.textContent = 'Todos';
    container.appendChild(btnTodos);

    categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = cat.id;
        btn.textContent = cat.name;
        container.appendChild(btn);
    });
}

export function bindFiltroEventos() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const categoria = e.target.dataset.category;

            document.querySelectorAll('.filter-btn')
                .forEach(b => b.classList.remove('active'));

            e.target.classList.add('active');

            filtrarPlatos(categoria);
        });
    });
}

export function bindSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', () => {
        const texto = input.value.toLowerCase();

        document.querySelectorAll('.dish-card').forEach(card => {
            const nombre = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();

            if (nombre.includes(texto) || desc.includes(texto)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}
function filtrarPlatos(categoriaId) {
    document.querySelectorAll('.dish-card').forEach(card => {
        if (categoriaId === 'all' || card.dataset.category === categoriaId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

