document.addEventListener('DOMContentLoaded', () => { if (document.body.id !== 'checkoutPage') return; renderCheckoutSummary(); document.getElementById('checkoutForm').addEventListener('submit', handleCheckout); });

async function renderCheckoutSummary() {
    const products = await fetchProducts();
    const container = document.getElementById('checkoutSummary');
    if (!container) return;
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    const validCart = cart
        .map(item => ({ id: item.id, quantity: Math.min(Math.max(1, item.quantity), MAX_ITEM_QUANTITY) }))
        .filter(item => products.some(p => p.id === item.id));
    if (!validCart.length) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    let subtotal = 0;
    const lines = validCart.map(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        return `<p>${item.quantity} x ${product.name} <strong>$${itemTotal.toFixed(2)}</strong></p>`;
    }).join('');
    const total = subtotal + 5;
    container.innerHTML = `${lines}<hr><p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p><p>Shipping: <strong>$5.00</strong></p><p>Total: <strong>$${total.toFixed(2)}</strong></p>`;
}

function validateCheckoutForm() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const city = document.getElementById('customerCity').value.trim();
    const state = document.getElementById('customerState').value.trim();
    const postal = document.getElementById('customerPostal').value.trim();
    const phonePattern = /^[0-9\-\s()+]{7,20}$/;
    const postalPattern = /^[0-9]{4,10}$/;
    if (!name || !email || !phone || !address || !city || !state || !postal) {
        alert('Please complete all checkout fields.');
        return false;
    }
    if (!phonePattern.test(phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }
    if (!postalPattern.test(postal)) {
        alert('Please enter a valid pincode/postal code.');
        return false;
    }
    return true;
}

async function handleCheckout(event) {
    event.preventDefault();
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    if (!cart.length) {
        alert('Your cart is empty.');
        return;
    }
    if (!validateCheckoutForm()) {
        return;
    }
    const products = await fetchProducts();
    const validCart = cart
        .map(item => ({ id: item.id, quantity: Math.min(Math.max(1, item.quantity), MAX_ITEM_QUANTITY) }))
        .filter(item => products.some(p => p.id === item.id));
    if (!validCart.length) {
        alert('Your cart contains invalid items.');
        return;
    }
    const orderItems = validCart.map(item => {
        const product = products.find(p => p.id === item.id);
        return { id: product.id, name: product.name, price: product.price, quantity: item.quantity };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
        id: `ORD${Date.now().toString().slice(-8)}`,
        status: 'Confirmed',
        items: orderItems,
        subtotal,
        shipping: 5,
        total: subtotal + 5,
        customer: {
            name: document.getElementById('customerName').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            address: document.getElementById('customerAddress').value.trim(),
            city: document.getElementById('customerCity').value.trim(),
            state: document.getElementById('customerState').value.trim(),
            postal: document.getElementById('customerPostal').value.trim(),
        },
        createdAt: new Date().toISOString()
    };
    sessionStorage.setItem('shopEaseLatestOrder', JSON.stringify(order));
    localStorage.removeItem('shopEaseCart');
    window.location.href = 'order-confirmation.html';
}
