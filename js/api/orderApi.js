export async function createOrder(data) {
    const response = await fetch('https://localhost:7266/api/v1/Order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const respJson = await response.json().catch(() => null);

    if (!response.ok) {
        console.error("Backend error:", respJson);
        throw new Error(respJson?.message || 'Error creando orden');
    }

    return respJson;
}

export async function updateOrder(id, data) {
    const response = await fetch(`https://localhost:7266/api/v1/Order/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const respJson = await response.json().catch(() => null);

    if (!response.ok) {
        console.error("Backend error:", respJson);
        throw new Error(respJson?.message || 'Error actualizando orden');
    }

    return respJson;
}

export async function getOrders() {
    const response = await fetch('https://localhost:7266/api/v1/Order');
    if (!response.ok) throw new Error('Error cargando comandas');
    return response.json();
}

export async function getOrderById(id) {
    const response = await fetch(`https://localhost:7266/api/v1/Order/${id}`);
    if (!response.ok) throw new Error('Error cargando la comanda');
    return response.json();
}

