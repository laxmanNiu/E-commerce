from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent / "E-Commerce-Website-v2"


# ---------------------------
# Directory structure (NO HTML)
# ---------------------------
DIRS = [
    ROOT / "assets" / "css",
    ROOT / "assets" / "js",
    ROOT / "assets" / "images" / "banners",
    ROOT / "assets" / "images" / "categories",
    ROOT / "assets" / "images" / "products",
    ROOT / "assets" / "images" / "testimonials",
    ROOT / "assets" / "images" / "icons",
    ROOT / "assets" / "data",
    ROOT / "components",
]


# ---------------------------
# File writer utility
# ---------------------------
def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"✔ Created: {path.relative_to(ROOT)}")


# ---------------------------
# Core JS (upgraded version)
# ---------------------------
MAIN_JS = """
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('components/navbar.html', 'navbar-placeholder');
    await loadComponent('components/footer.html', 'footer-placeholder');
    await loadComponent('components/scroll-top.html', 'scroll-top-placeholder');

    initNav();
    initScrollTop();
    loadPageFeatures();
});

async function loadComponent(url, targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;

    try {
        const res = await fetch(url);
        el.innerHTML = await res.text();
    } catch (e) {
        console.warn('Component failed:', url);
    }
}

function initNav() {
    document.addEventListener("click", (e) => {
        if (e.target.id === "navToggle") {
            document.querySelector("nav.main-nav")?.classList.toggle("open");
        }
    });
}

function initScrollTop() {
    const btn = document.getElementById("scrollTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        btn.style.display = window.scrollY > 300 ? "flex" : "none";
    });

    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadPageFeatures() {
    const page = document.body.id;

    if (page === "home") {
        initSlider();
        loadFeatured();
    }
}

function initSlider() {
    const slides = document.querySelectorAll(".slide");
    if (!slides.length) return;

    let i = 0;
    setInterval(() => {
        slides[i].classList.remove("active");
        i = (i + 1) % slides.length;
        slides[i].classList.add("active");
    }, 4500);
}

async function fetchProducts() {
    const res = await fetch("assets/data/products.json");
    return res.json();
}

async function loadFeatured() {
    const data = await fetchProducts();
    const box = document.getElementById("featuredProducts");
    if (!box) return;

    box.innerHTML = data.slice(0, 4).map(card).join("");
}

function card(p) {
    return `
    <article class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <div class="badge">${p.category}</div>
        <h4>${p.name}</h4>
        <p class="price">$${p.price}</p>
        <a class="button" href="product-details.html?id=${p.id}">View</a>
    </article>`;
}
"""


PRODUCTS_JS = """
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
"""


# ---------------------------
# Products JSON (unchanged)
# ---------------------------
PRODUCTS_JSON = json.dumps([
    {"id": 1, "name": "Wireless Headphones", "category": "electronics", "price": 129.99},
    {"id": 2, "name": "Smart Watch", "category": "electronics", "price": 189.99},
    {"id": 3, "name": "Leather Jacket", "category": "fashion", "price": 199.99},
], indent=2)


# ---------------------------
# Components (light version)
# ---------------------------
NAVBAR = """<header class="site-header">
<div class="logo"><a href="index.html">ShopEase V2</a></div>
<button id="navToggle">Menu</button>
<nav class="main-nav">
<a href="index.html">Home</a>
<a href="products.html">Products</a>
<a href="cart.html">Cart</a>
</nav>
</header>"""

FOOTER = """<footer class="site-footer">
<p>ShopEase V2 © 2026</p>
</footer>"""

SCROLL = """<button id="scrollTop">↑</button>"""


# ---------------------------
# Build process
# ---------------------------
def build():
    for d in DIRS:
        d.mkdir(parents=True, exist_ok=True)

    write_file(ROOT / "assets/js/main.js", MAIN_JS)
    write_file(ROOT / "assets/js/products.js", PRODUCTS_JS)
    write_file(ROOT / "assets/data/products.json", PRODUCTS_JSON)

    write_file(ROOT / "components/navbar.html", NAVBAR)
    write_file(ROOT / "components/footer.html", FOOTER)
    write_file(ROOT / "components/scroll-top.html", SCROLL)

    print("\n✅ ShopEase V2 backend scaffold generated (HTML excluded).")


if __name__ == "__main__":
    build()