const MAX_ITEM_QUANTITY = 10;

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
        status: 'Pending Payment',
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
    try {
        const paymentInfo = await showMockPayment(order.total);
        order.payment = paymentInfo;
        order.status = paymentInfo.status === 'Paid' ? 'Paid' : 'Payment Failed';
    } catch (err) {
        alert('Payment was cancelled or failed. Your order was not completed.');
        return;
    }
    if (typeof saveOrderForUser === 'function') {
        saveOrderForUser(order);
    }
    sessionStorage.setItem('shopEaseLatestOrder', JSON.stringify(order));
    localStorage.removeItem('shopEaseCart');
    window.location.href = 'order-confirmation.html';
}

function ensurePaymentModal() {
    if (document.getElementById('mockPaymentModal')) return;
    const modal = document.createElement('div');
    modal.id = 'mockPaymentModal';
    modal.innerHTML = `
    <div class="mock-modal-backdrop" role="dialog" aria-modal="true">
      <div class="mock-modal">
        <h3>Secure Payment (Mock)</h3>
        <p id="mockAmount"></p>
        <form id="mockPaymentForm">
          <label>Cardholder Name<br><input id="mpName" type="text" required></label>
          <label>Card Number<br><input id="mpNumber" type="text" pattern="[0-9 ]{12,19}" placeholder="4242 4242 4242 4242" required></label>
          <label>Expiry (MM/YY)<br><input id="mpExp" type="text" pattern="(0[1-9]|1[0-2])\/\d{2}" placeholder="04/28" required></label>
          <label>CVC<br><input id="mpCvc" type="text" pattern="\d{3,4}" required></label>
          <div class="mock-actions">
            <button type="submit">Pay</button>
            <button type="button" id="mockCancel">Cancel</button>
          </div>
        </form>
        <div id="mockProcessing" style="display:none">Processing payment…</div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    const style = document.createElement('style');
    style.textContent = `
    #mockPaymentModal .mock-modal-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.6);z-index:9999}
    #mockPaymentModal .mock-modal{background:#fff;padding:20px;border-radius:12px;max-width:420px;width:94%;box-shadow:0 10px 30px rgba(2,6,23,.4)}
    #mockPaymentModal label{display:block;margin:8px 0;font-size:0.95rem}
    #mockPaymentModal input{width:100%;padding:8px;margin-top:6px;border:1px solid #ddd;border-radius:6px}
    #mockPaymentModal .mock-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
    #mockPaymentModal button{padding:8px 12px;border-radius:6px;border:none;background:#2563eb;color:#fff}
    #mockPaymentModal #mockCancel{background:#6b7280}
    `;
    document.head.appendChild(style);
    document.getElementById('mockCancel').addEventListener('click', () => {
        dispatchPaymentModalEvent('cancel');
    });
    document.getElementById('mockPaymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('mockProcessing').style.display = 'block';
        // Simulate network/payment delay
        await new Promise(r => setTimeout(r, 1200));
        const txn = 'TXN' + Date.now().toString().slice(-10);
        document.getElementById('mockProcessing').style.display = 'none';
        dispatchPaymentModalEvent('success', {
            method: 'MockCard',
            status: 'Paid',
            transactionId: txn,
            cardLast4: document.getElementById('mpNumber').value.replace(/\s/g, '').slice(-4)
        });
    });
}

let __mockPaymentResolver;
function dispatchPaymentModalEvent(type, payload) {
    if (!__mockPaymentResolver) return;
    if (type === 'success') __mockPaymentResolver.resolve(payload);
    else __mockPaymentResolver.reject(new Error('cancel'));
    __mockPaymentResolver = null;
    const el = document.getElementById('mockPaymentModal');
    if (el) el.remove();
}

function showMockPayment(amount) {
    ensurePaymentModal();
    document.getElementById('mockAmount').textContent = `Amount to pay: $${amount.toFixed(2)}`;
    return new Promise((resolve, reject) => {
        __mockPaymentResolver = { resolve, reject };
    });
}
