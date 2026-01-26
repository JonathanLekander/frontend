let platos = [];
let platoActual = null;
let tiposEntrega = [];
let carrito = [];


function mostrarToast(mensaje, tipo = 'success') {

    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = mensaje;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function loadDishes() {
    try {
        const response = await fetch('https://localhost:7266/api/v1/Dish');
        if (!response.ok) throw new Error('Error en la respuesta');
        
        platos = await response.json();
        displayDishes(platos);
    } catch (error) {
        console.error('Error loading dishes:', error);
        mostrarToast('Error cargando el menú. Verifica que el backend esté corriendo.', 'error');
        document.getElementById('menu-container').innerHTML = 
            '<p>Error cargando el menú. Verifica que el backend esté corriendo.</p>';
    }
}

async function loadCategories() {
    try {
        const response = await fetch('https://localhost:7266/api/v1/Category');
        const categories = await response.json();
        createFilterButtons(categories);
    } catch (error) {
        console.error('Error en cargar las categorias:', error);
        mostrarToast('Error cargando las categorías', 'error');
    }
}

async function loadDeliveryTypes() {
    try {
        const response = await fetch('https://localhost:7266/api/v1/DeliveryType');
        if (!response.ok) throw new Error('Error cargando tipos de entrega');
        
        tiposEntrega = await response.json();
        DeliveryTypes();
    } catch (error) {
        console.error('Error cargando los DeliveryTypes:', error);
        mostrarToast('Error cargando tipos de entrega', 'error');
    }
}

function DeliveryTypes() {
    const select = document.getElementById('tipo-entrega-select');
    select.innerHTML = '<option value="">Seleccionar tipo de entrega</option>';
    const traducciones = {
        'Delivery': 'Delivery',
        'Take away': 'Take away',
        'Dine in': 'Dine in'
    };
    
    tiposEntrega.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = traducciones[tipo.name] || tipo.name;
        select.appendChild(option);
    });
}

function displayDishes(dishes) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';

    console.log('Platos recibidos:', dishes); 

    const platosDisponibles = dishes.filter(dish => {
        return dish.available === true || 
               dish.Available === true || 
               dish.isActive === true;
    });

    console.log('Platos disponibles:', platosDisponibles);

    if (platosDisponibles.length === 0) {
        menuContainer.innerHTML = '<p>No hay platos disponibles en este momento</p>';
        return;
    }

    platosDisponibles.forEach(dish => {
        const dishCard = `
            <div class="dish-card" data-category="${dish.category.id}">
                <img src="${dish.image}" alt="${dish.name}" 
                     onclick="abrirDetalles('${dish.id}')" style="cursor: pointer;">
                <h3>${dish.name}</h3>
                <p>${dish.description.substring(0, 100)}...</p>
                <span class="price">$${dish.price}</span>
            </div>
        `;
        menuContainer.innerHTML += dishCard;
    });
}

function createFilterButtons(categories) {
    const filterContainer = document.getElementById('filter-buttons');
    
    filterContainer.innerHTML = '<button class="filter-btn active" data-category="all">Todos</button>';
    
    categories.forEach(category => {
        const button = `
            <button class="filter-btn" data-category="${category.id}">
                ${category.name}
            </button>
        `;
        filterContainer.innerHTML += button;
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', filterDishes);
    });
}

function filterDishes(event) {
    const categoryId = event.target.dataset.category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const dishCards = document.querySelectorAll('.dish-card');
    dishCards.forEach(card => {
        if (categoryId === 'all' || card.dataset.category === categoryId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const dishCards = document.querySelectorAll('.dish-card');
        
        document.querySelectorAll('.filter-options button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        dishCards.forEach(card => {
            const dishName = card.querySelector('h3').textContent.toLowerCase();
            const dishDescription = card.querySelector('p').textContent.toLowerCase();
            
            if (dishName.includes(searchTerm) || dishDescription.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function actualizarPrecioTotal() {
    if (!platoActual) return;
    
    const cantidad = parseInt(document.getElementById('cantidad-input').value) || 1;
    const precioUnitario = platoActual.price;
    const precioTotal = precioUnitario * cantidad;
    document.getElementById('precio-total').textContent = precioTotal.toFixed(2);
}

function abrirDetalles(dishId) {
    platoActual = platos.find(dish => dish.id === dishId);
    
    if (platoActual) {
        document.getElementById('detalles-imagen').src = platoActual.image;
        document.getElementById('detalles-nombre').textContent = platoActual.name;
        document.getElementById('detalles-descripcion').textContent = platoActual.description;
        document.getElementById('detalles-precio').textContent = `$${platoActual.price}`;
        document.getElementById('cantidad-input').value = '1';
        document.getElementById('notas-plato').value = '';
        document.getElementById('tipo-entrega-select').value = '';
        
        actualizarPrecioTotal();
        
        document.getElementById('dish-detalles').style.display = 'block';
    }
}

function cerrarDetalles() {
    document.getElementById('dish-detalles').style.display = 'none';
}

function aumentarCantidad() {
    const input = document.getElementById('cantidad-input');
    input.value = parseInt(input.value) + 1;
    actualizarPrecioTotal(); 
}

function disminuirCantidad() {
    const input = document.getElementById('cantidad-input');
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
        actualizarPrecioTotal(); 
    }
}

function validarFormularioCarrito() {
    const tipoEntrega = document.getElementById('tipo-entrega-select').value;
    const cantidad = document.getElementById('cantidad-input').value;
    
    if (!tipoEntrega) {
        mostrarToast('Por favor selecciona un tipo de entrega', 'error');
        return false;
    }
    
    if (!cantidad || cantidad < 1) {
        mostrarToast('La cantidad debe ser al menos 1', 'error');
        return false;
    }
    
    return true;
}

function agregarAlCarrito() {
    if (!platoActual) return;
    
    const cantidad = parseInt(document.getElementById('cantidad-input').value);
    const notas = document.getElementById('notas-plato').value;
    const tipoEntregaId = parseInt(document.getElementById('tipo-entrega-select').value);
    const tipoEntregaTexto = document.getElementById('tipo-entrega-select').options[document.getElementById('tipo-entrega-select').selectedIndex].text;
    
    if (!validarFormularioCarrito()) {
        return;
    }

    const item = {
        dishId: platoActual.id,
        nombre: platoActual.name,
        precio: platoActual.price,
        cantidad: cantidad,
        notas: notas,
        tipoEntregaId: tipoEntregaId,
        tipoEntregaTexto: tipoEntregaTexto,
        imagen: platoActual.image 
    };

    carrito.push(item);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    document.getElementById('dish-detalles').style.display = 'none';
    mostrarToast(`${platoActual.name} agregado al carrito`, 'success');
}

document.getElementById('cantidad-input').addEventListener('input', function() {
    if (this.value < 1) this.value = 1;
    actualizarPrecioTotal();
});

function toggleCarrito() {
    const modal = document.getElementById('carrito-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    actualizarCarritoUI();
}

function cerrarCarrito() {
    document.getElementById('carrito-modal').style.display = 'none';
}

function actualizarCarritoUI() {
    const carritoItems = document.getElementById('carrito-items');
    const carritoTotal = document.getElementById('carrito-total');
    const notasTextarea = document.getElementById('notas-generales-pedido');
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
        carritoTotal.textContent = '0';
        if (notasTextarea) notasTextarea.placeholder = 'Notas generales del pedido...'; 
        
        const btnConfirmar = document.querySelector('.btn-confirmar-pedido');
        if (btnConfirmar) {
            const comandaActiva = sessionStorage.getItem('comandaActiva');
            if (comandaActiva) {
                btnConfirmar.textContent = `Agregar a Comanda #${comandaActiva}`;
                btnConfirmar.onclick = actualizarOrden;
                btnConfirmar.disabled = true;
            } else {
                btnConfirmar.textContent = 'Confirmar Pedido';
                btnConfirmar.onclick = crearOrden;
                btnConfirmar.disabled = true; 
            }
        }
        return;
    }
    
    if (notasTextarea) {
        const tipoEntrega = carrito[0].tipoEntregaId;
        if (tipoEntrega === 1) {
            notasTextarea.placeholder = 'Ej: Av. Corrientes 1234, Piso 5 Depto B, Timbre: 5B...';
        } else if (tipoEntrega === 2) {
            notasTextarea.placeholder = 'Ej: Nombre: María González, Hora de retiro: 20:30...';
        } else {
            notasTextarea.placeholder = 'Ej: Mesa 4, Comedor principal, Zona fumadores...';
        }
    }
    
    carritoItems.innerHTML = carrito.map((item, index) => `
        <div class="carrito-item">
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <div class="item-detalles">
                    Cantidad: ${item.cantidad} | ${item.tipoEntregaTexto}
                    ${item.notas ? `<br>Notas: ${item.notas}` : ''}
                </div>
                <div class="item-precio">$${item.precio} c/u</div>
            </div>
            <button onclick="eliminarItem(${index})" class="btn-eliminar">×</button>
        </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    carritoTotal.textContent = total.toFixed(2);
    
    const btnConfirmar = document.querySelector('.btn-confirmar-pedido');
    if (btnConfirmar) {
        const comandaActiva = sessionStorage.getItem('comandaActiva');
        
        if (comandaActiva) {
            btnConfirmar.textContent = `Agregar a Comanda #${comandaActiva}`;
            btnConfirmar.onclick = actualizarOrden;
            btnConfirmar.disabled = false;
        } else {
            btnConfirmar.textContent = 'Confirmar Pedido';
            btnConfirmar.onclick = crearOrden;
            btnConfirmar.disabled = false; 
        }
    }
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
    mostrarToast('Plato eliminado del carrito', 'success');
}

async function actualizarOrden() {
    try {
        const comandaActiva = sessionStorage.getItem('comandaActiva');
        
        if (!comandaActiva) {
            mostrarToast('No hay una comanda activa seleccionada', 'error');
            return;
        }

        const ordenRequest = {
            items: carrito.map(item => ({
                id: item.dishId,
                quantity: item.cantidad,
                notes: item.notas || ""  
            }))
        };

        const response = await fetch(`https://localhost:7266/api/v1/Order/${comandaActiva}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ordenRequest)
        });

        if (!response.ok) throw new Error('Error al actualizar orden');

        const ordenActualizada = await response.json();
        
        carrito = [];
        localStorage.removeItem('carrito');
        actualizarCarritoUI();
        cerrarCarrito();
        
        mostrarToast(`¡Platos agregados a la comanda #${comandaActiva}!\nNuevo total: $${ordenActualizada.totalAmount}`, 'success');
        
    } catch (error) {
        mostrarToast('Error al agregar platos a la comanda', 'error');
    }
}

async function crearOrden() {
    try {
        const notasGenerales = document.getElementById('notas-generales-pedido').value;

        const ordenRequest = {
            items: carrito.map(item => ({
                id: item.dishId,
                quantity: item.cantidad,
                notes: item.notas || ""  
            })),
            delivery: {
                id: carrito[0].tipoEntregaId,
                to: carrito[0].tipoEntregaTexto
            },
            notes: notasGenerales  
        };

        console.log('Orden a crear:', ordenRequest);

        const response = await fetch('https://localhost:7266/api/v1/Order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ordenRequest)
        });

        if (!response.ok) throw new Error('Error al crear orden');

        const ordenCreada = await response.json();
        
        carrito = [];
        localStorage.removeItem('carrito');
        document.getElementById('notas-generales-pedido').value = '';
        actualizarCarritoUI();
        cerrarCarrito();
        
        mostrarToast(`Pedido confirmado!\nNúmero: ${ordenCreada.orderNumber}\nTotal: $${ordenCreada.totalAmount}`, 'success');
        
    } catch (error) {
        mostrarToast('Error al confirmar pedido', 'error');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadDishes();
    loadCategories();
    loadDeliveryTypes();
    setupSearch();

    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }

    actualizarCarritoUI();
});