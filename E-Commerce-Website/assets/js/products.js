document.addEventListener('DOMContentLoaded', () => {
    if (!['productsPage', 'productDetailsPage', 'categoriesPage'].includes(document.body.id)) return;
    initProductsPage();
});

async function initProductsPage() {
    const products = await fetchProducts();
    const pageId = document.body.id;

    if (pageId === 'productDetailsPage') {
        initProductDetails(products);
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get('category') || 'all';
    const categoryFilter = document.getElementById('categoryFilter');
    const sellerFilter = document.getElementById('sellerFilter');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortFilter = document.getElementById('sortFilter');
    const productSearch = document.getElementById('productSearch');
    const productSearchForm = document.getElementById('productSearchForm');
    const clearFilters = document.getElementById('clearFilters');

    populateSellerFilter(products, sellerFilter);
    if (categoryFilter) categoryFilter.value = selectedCategory;
    if (priceRange && priceValue) priceValue.textContent = `$${priceRange.value}`;

    const renderCurrentProducts = () => renderProducts(products, getFilters());
    renderCurrentProducts();

    categoryFilter?.addEventListener('change', renderCurrentProducts);
    sellerFilter?.addEventListener('change', renderCurrentProducts);
    ratingFilter?.addEventListener('change', renderCurrentProducts);
    sortFilter?.addEventListener('change', renderCurrentProducts);
    productSearch?.addEventListener('input', renderCurrentProducts);
    productSearchForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        renderCurrentProducts();
    });
    priceRange?.addEventListener('input', () => {
        if (priceValue) priceValue.textContent = `$${priceRange.value}`;
        renderCurrentProducts();
    });
    clearFilters?.addEventListener('click', () => {
        if (categoryFilter) categoryFilter.value = 'all';
        if (sellerFilter) sellerFilter.value = 'all';
        if (ratingFilter) ratingFilter.value = '0';
        if (sortFilter) sortFilter.value = 'featured';
        if (productSearch) productSearch.value = '';
        if (priceRange) {
            priceRange.value = priceRange.max || '500';
            if (priceValue) priceValue.textContent = `$${priceRange.value}`;
        }
        renderCurrentProducts();
    });
}

function populateSellerFilter(products, sellerFilter) {
    if (!sellerFilter) return;
    const sellers = Array.from(new Set(products.map(product => product.seller).filter(Boolean))).sort();
    sellerFilter.innerHTML = '<option value="all">All Sellers</option>' + sellers
        .map(seller => `<option value="${seller}">${seller}</option>`)
        .join('');
}

function getFilters() {
    return {
        category: document.getElementById('categoryFilter')?.value || 'all',
        seller: document.getElementById('sellerFilter')?.value || 'all',
        maxPrice: Number(document.getElementById('priceRange')?.value || 2000000),
        minRating: Number(document.getElementById('ratingFilter')?.value || 0),
        sort: document.getElementById('sortFilter')?.value || 'featured',
        query: (document.getElementById('productSearch')?.value || '').trim().toLowerCase()
    };
}

function renderProducts(products, filtersOrCategory, legacyMaxPrice) {
    const container = document.getElementById('productList') || document.getElementById('relatedProducts');
    if (!container) return;

    const filters = typeof filtersOrCategory === 'object'
        ? filtersOrCategory
        : {
            category: filtersOrCategory || 'all',
            seller: 'all',
            maxPrice: legacyMaxPrice || 2000000,
            minRating: 0,
            sort: 'featured',
            query: ''
        };

    const filtered = sortProducts(products.filter(product => productMatchesFilters(product, filters)), filters.sort);
    updateResultsStatus(filtered.length, products.length, filters);

    if (!filtered.length) {
        container.innerHTML = '<p class="empty-results">No products found. Try changing your search or filters.</p>';
        return;
    }

    container.innerHTML = filtered.map(product => buildProductCard(product)).join('');
}

function productMatchesFilters(product, filters) {
    const queryText = [
        product.name,
        product.category,
        product.seller,
        product.description
    ].join(' ').toLowerCase();

    return (filters.category === 'all' || product.category === filters.category)
        && (filters.seller === 'all' || product.seller === filters.seller)
        && product.price <= filters.maxPrice
        && product.rating >= filters.minRating
        && (!filters.query || queryText.includes(filters.query));
}

function sortProducts(products, sort) {
    const sorted = [...products];
    if (sort === 'price-low') return sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') return sorted.sort((a, b) => b.price - a.price);
    if (sort === 'rating-high') return sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
}

function updateResultsStatus(count, total, filters) {
    const status = document.getElementById('resultsStatus');
    if (!status) return;
    const hasFilters = filters.query
        || filters.category !== 'all'
        || filters.seller !== 'all'
        || filters.minRating > 0
        || filters.maxPrice < 2000000;
    status.textContent = hasFilters
        ? `${count} of ${total} products match your filters`
        : `Showing ${total} products`;
}

function buildProductCard(product) {
    const stars = '&#9733;'.repeat(Math.round(product.rating));
    return `<article class="product-card"><img src="${product.image}" alt="${product.name}"><div class="card-meta"><span class="badge">${product.category}</span><span class="seller">Sold by ${product.seller || 'ShopEase'}</span></div><h4>${product.name}</h4><p class="price">$${product.price.toFixed(2)}</p><div class="rating" aria-label="${product.rating} out of 5 stars">${stars} <span>${product.rating}</span></div><p class="delivery">${product.delivery || 'Fast delivery available'}</p><a class="button" href="product-details.html?id=${product.id}">View details</a></article>`;
}

async function initProductDetails(products) {
    if (document.body.id !== 'productDetailsPage') return;
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get('id'));
    const product = products.find(p => p.id === productId) || products[0];
    document.getElementById('detailTitle').textContent = product.name;
    document.getElementById('detailDescription').textContent = product.description;
    document.getElementById('detailPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('detailRating').innerHTML = `${'&#9733;'.repeat(Math.round(product.rating))} (${product.rating})`;

    const detailDescription = document.getElementById('detailDescription');
    if (detailDescription && product.seller && !document.querySelector('.detail-seller')) {
        detailDescription.insertAdjacentHTML('afterend', `<p class="detail-seller">Sold by <strong>${product.seller}</strong> · ${product.delivery || 'Fast delivery available'}</p>`);
    }

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
