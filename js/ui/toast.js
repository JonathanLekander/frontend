let toastTimeout;

export function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;

    if (toastTimeout) clearTimeout(toastTimeout);

    toast.textContent = mensaje;
    toast.className = `toast show ${tipo}`;

    toastTimeout = setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}
