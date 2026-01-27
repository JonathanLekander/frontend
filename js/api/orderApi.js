export async function crearOrdenApi(data) {
    const response = await fetch('https://localhost:7266/api/v1/Order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Error creando orden');
    return response.json();
}

export async function actualizarOrdenApi(id, data) {
    const response = await fetch(`https://localhost:7266/api/v1/Order/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Error actualizando orden');
    return response.json();
}