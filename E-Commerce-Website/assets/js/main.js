document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('components/navbar.html', 'navbar-placeholder');
    await loadComponent('components/footer.html', 'footer-placeholder');
    await loadComponent('components/scroll-top.html', 'scroll-top-placeholder');
    initNavToggle();
    initScrollToTop();
    loadPageFeatures();
});

async function loadComponent(url, targetId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
    } catch (error) {
        console.warn('Component load failed', url, error);
    }
}

function initNavToggle() {
    document.addEventListener('click', (event) => {
        if (event.target.id === 'navToggle') {
            const nav = document.querySelector('nav.main-nav');
            nav && nav.classList.toggle('open');
        }
    });
}

function initScrollToTop() {
    const button = document.getElementById('scrollTop');
    if (!button) return;
    window.addEventListener('scroll', () => {
        button.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    button.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
}

function loadPageFeatures() {
    const pageId = document.body.id;
    if (pageId === 'home') {
        initHeroSlider();
        loadFeaturedProducts();
    }
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (!slides.length) return;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

async function fetchProducts() {
    try {
        const res = await fetch('assets/data/products.json');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function loadFeaturedProducts() {
    const products = await fetchProducts();
    const featured = products.slice(0, 4);
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    container.innerHTML = featured.map(product => productCard(product)).join('');
}

function productCard(product) {
    return `<article class="product-card"><img src="${product.image}" alt="${product.name}"><div class="badge">${product.category}</div><h4>${product.name}</h4><p class="price">$${product.price.toFixed(2)}</p><div class="rating">${'★'.repeat(Math.round(product.rating))}</div><a class="button" href="product-details.html?id=${product.id}">View</a></article>`;
}

function getCartCount() {
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartLink() {
    const nav = document.querySelector('nav.main-nav');
    if (!nav) return;
    const count = getCartCount();
    const existing = document.getElementById('cartCount');
    if (existing) {
        existing.textContent = count;
        return;
    }
    const cartLink = Array.from(nav.querySelectorAll('a')).find(a => a.href.includes('cart.html'));
    if (cartLink) {
        const badge = document.createElement('span');
        badge.id = 'cartCount';
        badge.textContent = count;
        badge.style.marginLeft = '8px';
        badge.style.color = '#4f46e5';
        cartLink.appendChild(badge);
    }
}

window.addEventListener('load', updateCartLink);
window.addEventListener('storage', updateCartLink);
