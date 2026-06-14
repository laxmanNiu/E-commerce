document.addEventListener('DOMContentLoaded', () => {
    const orderData = JSON.parse(sessionStorage.getItem('shopEaseLatestOrder') || 'null');
    if (!orderData) return;
    document.getElementById('orderNumber').textContent = orderData.id;
    document.getElementById('orderStatus').textContent = orderData.status;
    const summary = document.getElementById('confirmationSummary');
    if (summary) {
        summary.innerHTML = `<div class="order-summary-card"><h3>Order Summary</h3>${orderData.items.map(item => `<p>${item.quantity} x ${item.name} <strong>$${(item.price * item.quantity).toFixed(2)}</strong></p>`).join('')}<hr><p>Subtotal: <strong>$${orderData.subtotal.toFixed(2)}</strong></p><p>Shipping: <strong>$${orderData.shipping.toFixed(2)}</strong></p><p>Total: <strong>$${orderData.total.toFixed(2)}</strong></p></div>`;
    }
});
