document.addEventListener('DOMContentLoaded', () => {
if (document.body.id !== 'searchPage') return;


const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (!searchBtn || !searchInput) return;

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('input', debounce(performSearch, 300));

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

updateSearchHistory();


});

function debounce(fn, delay) {
let timeout;


return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        fn(...args);
    }, delay);
};


}

async function performSearch() {


const searchInput =
    document.getElementById('searchInput');

const status =
    document.getElementById('searchStatus');

const container =
    document.getElementById('searchResults');

if (!searchInput || !status || !container) return;

const query =
    searchInput.value
        .trim()
        .toLowerCase();

if (!query) {

    status.textContent =
        'Type any keyword to begin searching.';

    container.innerHTML = '';

    return;
}

try {

    status.textContent =
        'Searching products...';

    const products =
        await fetchProducts();

    const results =
        products.filter(product => {

            const searchableText = [
                product.name,
                product.category,
                product.description,
                product.seller
            ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

            return searchableText.includes(query);
        });

    saveSearchHistory(query);

    renderResults(results);

    status.textContent =
        results.length === 1
            ? '1 product found.'
            : `${results.length} products found.`;

} catch (error) {

    console.error(error);

    status.textContent =
        'Failed to load products.';

    container.innerHTML =
        '<p class="empty-results">Something went wrong. Please try again.</p>';
}


}

function renderResults(results) {


const container =
    document.getElementById('searchResults');

if (!container) return;

if (!results.length) {

    container.innerHTML = `
        <div class="empty-results">
            <h3>No products found</h3>
            <p>Try a different keyword.</p>
        </div>
    `;

    return;
}

container.innerHTML =
    results.map(buildProductCard).join('');


}

function buildProductCard(product) {


const stars =
    '★'.repeat(
        Math.round(product.rating || 0)
    );

return `
<article class="product-card">

    <img
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
    >

    <div class="card-meta">
        <span class="badge">
            ${product.category}
        </span>
    </div>

    <h4>${product.name}</h4>

    <p class="price">
        $${Number(product.price).toFixed(2)}
    </p>

    <div class="rating">
        ${stars}
        <span>${product.rating || 0}</span>
    </div>

    <p class="seller">
        ${product.seller || 'ShopEase'}
    </p>

    <div class="product-actions">

        <button
            class="btn-cart"
            onclick="quickAddToCart(${product.id})">
            Add To Cart
        </button>

        <button
            class="btn-wishlist"
            onclick="toggleWishlist(${product.id})">
            ♥
        </button>

    </div>

    <a
        class="button"
        href="product-details.html?id=${product.id}">
        View Details
    </a>

</article>
`;


}

function quickAddToCart(productId) {


fetchProducts()
    .then(products => {

        const product =
            products.find(
                p => p.id === productId
            );

        if (!product) return;

        let cart =
            JSON.parse(
                localStorage.getItem(
                    'shopEaseCart'
                ) || '[]'
            );

        const existing =
            cart.find(
                item =>
                    item.id === product.id
            );

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id: product.id,
                quantity: 1
            });
        }

        localStorage.setItem(
            'shopEaseCart',
            JSON.stringify(cart)
        );

        showToast(
            `${product.name} added to cart`
        );
    });


}

function toggleWishlist(productId) {


let wishlist =
    JSON.parse(
        localStorage.getItem(
            'shopEaseWishlist'
        ) || '[]'
    );

const index =
    wishlist.indexOf(productId);

if (index > -1) {
    wishlist.splice(index, 1);
} else {
    wishlist.push(productId);
}

localStorage.setItem(
    'shopEaseWishlist',
    JSON.stringify(wishlist)
);

showToast(
    'Wishlist updated'
);


}

function saveSearchHistory(query) {


let history =
    JSON.parse(
        localStorage.getItem(
            'shopEaseSearchHistory'
        ) || '[]'
    );

history =
    history.filter(
        item => item !== query
    );

history.unshift(query);

history = history.slice(0, 5);

localStorage.setItem(
    'shopEaseSearchHistory',
    JSON.stringify(history)
);

updateSearchHistory();


}

function updateSearchHistory() {


const container =
    document.getElementById(
        'searchHistory'
    );

if (!container) return;

const history =
    JSON.parse(
        localStorage.getItem(
            'shopEaseSearchHistory'
        ) || '[]'
    );

if (!history.length) {
    container.innerHTML = '';
    return;
}

container.innerHTML =
    history.map(item => `
        <button
            class="history-chip"
            onclick="useHistory('${item}')">
            ${item}
        </button>
    `).join('');


}

function useHistory(query) {


const input =
    document.getElementById(
        'searchInput'
    );

if (!input) return;

input.value = query;

performSearch();


}

function showToast(message) {


const toast =
    document.createElement('div');

toast.className =
    'toast-notification';

toast.textContent =
    message;

document.body.appendChild(
    toast
);

setTimeout(() => {
    toast.remove();
}, 2500);


}
