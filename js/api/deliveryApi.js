export async function getDeliveryTypes() {
    const response = await fetch('https://localhost:7266/api/v1/DeliveryType');
    if (!response.ok) throw new Error('Error cargando tipos de entrega');
    return response.json();
}