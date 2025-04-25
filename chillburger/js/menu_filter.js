document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".btn-filter");
    const items   = document.querySelectorAll(".menu-item");

    buttons.forEach(btn => btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.category;

        items.forEach(card => {
            card.style.display = (cat === "all" || card.dataset.category === cat)
                                ? "" : "none";
        });
    }));
});
