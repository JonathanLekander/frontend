export function formatearFecha(fecha) {
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