export async function getCategories() {
    const response = await fetch('https://localhost:7266/api/v1/Category');
    if (!response.ok) throw new Error('Error cargando categorías');
    return response.json();
}