const MAX_ITEM_QUANTITY = 10;
const MAX_CART_ITEMS = 20;

document.addEventListener('DOMContentLoaded', () => { if (document.body.id !== 'cartPage') return; renderCart(); });

async function renderCart() {
    const products = await fetchProducts();
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    if (!container || !subtotalEl || !totalEl) return;
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    const sanitizedCart = cart.map(item => ({ id: item.id, quantity: Math.min(Math.max(1, item.quantity), MAX_ITEM_QUANTITY) }));
    const validCart = sanitizedCart.filter(item => products.some(p => p.id === item.id));
    if (validCart.length !== cart.length) {
        localStorage.setItem('shopEaseCart', JSON.stringify(validCart));
    }
    if (!validCart.length) {
        container.innerHTML = '<p>Your cart is empty. Add some products to continue.</p>';
        subtotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }
    let subtotal = 0;
    container.innerHTML = validCart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        return `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div class="item-details"><h4>${product.name}</h4><p>$${product.price.toFixed(2)} x ${item.quantity}</p><div class="item-actions"><button onclick="updateQuantity(${product.id}, ${item.quantity - 1})">-</button><button onclick="updateQuantity(${product.id}, ${item.quantity + 1})">+</button><button onclick="removeItem(${product.id})">Remove</button></div></div></div>`;
    }).join('');
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${(subtotal + 5).toFixed(2)}`;
}

function updateQuantity(productId, newQuantity) {
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    if (newQuantity < 1) {
        return removeItem(productId);
    }
    item.quantity = Math.min(newQuantity, MAX_ITEM_QUANTITY);
    localStorage.setItem('shopEaseCart', JSON.stringify(cart));
    renderCart();
    window.dispatchEvent(new Event('storage'));
}

function removeItem(productId) {
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]').filter(i => i.id !== productId);
    localStorage.setItem('shopEaseCart', JSON.stringify(cart));
    renderCart();
    window.dispatchEvent(new Event('storage'));
}

window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
