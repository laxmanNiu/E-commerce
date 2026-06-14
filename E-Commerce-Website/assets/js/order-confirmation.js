document.addEventListener('DOMContentLoaded', () => {
    const orderData = JSON.parse(sessionStorage.getItem('shopEaseLatestOrder') || 'null');
    if (!orderData) return;
    document.getElementById('orderNumber').textContent = orderData.id;
    document.getElementById('orderStatus').textContent = orderData.status;
    const summary = document.getElementById('confirmationSummary');
    if (summary) {
        let paymentHtml = '';
        if (orderData.payment) {
            paymentHtml = `<hr><h4>Payment</h4><p>Method: <strong>${orderData.payment.method}</strong></p><p>Transaction: <strong>${orderData.payment.transactionId}</strong></p><p>Status: <strong>${orderData.payment.status}</strong></p>`;
            if (orderData.payment.cardLast4) paymentHtml += `<p>Card: **** **** **** ${orderData.payment.cardLast4}</p>`;
        }
        summary.innerHTML = `<div class="order-summary-card"><h3>Order Summary</h3>${orderData.items.map(item => `<p>${item.quantity} x ${item.name} <strong>$${(item.price * item.quantity).toFixed(2)}</strong></p>`).join('')}<hr><p>Subtotal: <strong>$${orderData.subtotal.toFixed(2)}</strong></p><p>Shipping: <strong>$${orderData.shipping.toFixed(2)}</strong></p><p>Total: <strong>$${orderData.total.toFixed(2)}</strong></p>${paymentHtml}</div>`;
    }
});
