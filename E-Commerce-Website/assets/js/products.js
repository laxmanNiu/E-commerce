document.addEventListener('DOMContentLoaded', () => {
    if (!['productsPage','productDetailsPage','categoriesPage'].includes(document.body.id)) return;
    initProductsPage();
});

async function initProductsPage() {
    const products = await fetchProducts();
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get('category') || 'all';
    const categoryFilter = document.getElementById('categoryFilter');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (categoryFilter) categoryFilter.value = selectedCategory;
    if (priceRange) priceValue.textContent = `$${priceRange.value}`;

    renderProducts(products, selectedCategory, Number(priceRange?.value || 500));

    categoryFilter?.addEventListener('change', () => renderProducts(products, categoryFilter.value, Number(priceRange.value)));
    priceRange?.addEventListener('input', () => {
        priceValue.textContent = `$${priceRange.value}`;
        renderProducts(products, categoryFilter.value, Number(priceRange.value));
    });
}

function renderProducts(products, category, maxPrice) {
    const container = document.getElementById('productList') || document.getElementById('relatedProducts');
    if (!container) return;
    const filtered = products.filter(p => (category === 'all' || p.category === category) && p.price <= maxPrice);
    if (!filtered.length) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }
    container.innerHTML = filtered.map(p => buildProductCard(p)).join('');
}

function buildProductCard(product) {
    return `<article class="product-card"><img src="${product.image}" alt="${product.name}"><div class="badge">${product.category}</div><h4>${product.name}</h4><p class="price">$${product.price.toFixed(2)}</p><div class="rating">${'★'.repeat(Math.round(product.rating))}</div><a class="button" href="product-details.html?id=${product.id}">View</a></article>`;
}

async function initProductDetails() {
    if (document.body.id !== 'productDetailsPage') return;
    const products = await fetchProducts();
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get('id'));
    const product = products.find(p => p.id === productId) || products[0];
    document.getElementById('detailTitle').textContent = product.name;
    document.getElementById('detailDescription').textContent = product.description;
    document.getElementById('detailPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('detailRating').textContent = `${'★'.repeat(Math.round(product.rating))} (${product.rating})`;
    const detailImage = document.getElementById('detailImage');
    detailImage.src = product.image;
    detailImage.alt = product.name;
    const thumbnails = document.getElementById('detailThumbnails');
    thumbnails.innerHTML = product.gallery.map((src, index) => `<img src="${src}" class="${index === 0 ? 'active' : ''}" alt="Thumbnail ${index + 1}">`).join('');
    thumbnails.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'IMG') {
            detailImage.src = target.src;
            thumbnails.querySelectorAll('img').forEach(img => img.classList.remove('active'));
            target.classList.add('active');
        }
    });
    document.getElementById('addToCartBtn').addEventListener('click', () => addToCart(product));
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    document.getElementById('relatedProducts').innerHTML = related.map(buildProductCard).join('');
}

initProductDetails();

const MAX_ITEM_QUANTITY = 10;
const MAX_CART_ITEMS = 20;

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems >= MAX_CART_ITEMS) {
        alert('You have reached the maximum cart quantity. Please checkout first.');
        return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, MAX_ITEM_QUANTITY);
    } else {
        cart.push({ id: product.id, quantity: 1 });
    }
    localStorage.setItem('shopEaseCart', JSON.stringify(cart));
    alert('Product added to cart');
    window.dispatchEvent(new Event('storage'));
}
