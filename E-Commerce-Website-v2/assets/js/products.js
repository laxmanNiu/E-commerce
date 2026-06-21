
document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.id.includes("products") &&
        !document.body.id.includes("product") &&
        !document.body.id.includes("categories")) return;

    init();
});

async function init() {
    const products = await fetchProducts();
    render(products);
}

async function fetchProducts() {
    const res = await fetch("assets/data/products.json");
    return res.json();
}

function render(products) {
    const container =
        document.getElementById("productList") ||
        document.getElementById("relatedProducts");

    if (!container) return;

    container.innerHTML = products.map(p => `
        <article class="product-card">
            <img src="${p.image}">
            <h4>${p.name}</h4>
            <p>$${p.price}</p>
            <a class="button" href="product-details.html?id=${p.id}">View</a>
        </article>
    `).join("");
}
