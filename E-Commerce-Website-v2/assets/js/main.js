
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
