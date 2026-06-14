document.addEventListener('DOMContentLoaded', () => {
    if (document.body.id !== 'searchPage') return;
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('input', debounce(performSearch, 250));
    searchInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') performSearch(); });
});

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus');
    const container = document.getElementById('searchResults');
    if (!container || !status) return;
    if (!query) {
        status.textContent = 'Type any keyword to begin.';
        container.innerHTML = '';
        return;
    }
    const products = await fetchProducts();
    const results = products.filter(product => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));
    status.textContent = results.length ? `${results.length} products found.` : 'No products matched your search.';
    container.innerHTML = results.length ? results.map(product => `<article class="product-card"><img src="${product.image}" alt="${product.name}"><div class="badge">${product.category}</div><h4>${product.name}</h4><p class="price">$${product.price.toFixed(2)}</p><a class="button" href="product-details.html?id=${product.id}">View</a></article>`).join('') : '<p>No products matched your search.</p>';
}
