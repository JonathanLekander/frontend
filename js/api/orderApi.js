export async function createOrder(data) {
    const response = await fetch('https://localhost:7266/api/v1/Order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const respJson = await response.json().catch(() => null); // por si no es JSON

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

    if (!response.ok) throw new Error('Error actualizando orden');
    return response.json();
}