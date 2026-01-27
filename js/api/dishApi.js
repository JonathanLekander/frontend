export async function getDishes() {
    const response = await fetch('https://localhost:7266/api/v1/Dish');
    if (!response.ok) throw new Error('Error cargando platos');
    return response.json();
}
