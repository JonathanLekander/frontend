export function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = "block";

    modal.addEventListener("click", e => {
        if (e.target === modal) {
            closeModal(id);
        }
    });
}

export function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

