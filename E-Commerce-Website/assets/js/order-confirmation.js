/* ==========================================================
    ShopEase V2 Order Confirmation
   ========================================================== */

const ORDER_STORAGE_KEY =
    "shopEaseLatestOrder";

/* ==========================================================
    Utilities
   ========================================================== */

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
}

function getLatestOrder() {
    try {
        return JSON.parse(
            sessionStorage.getItem(
                ORDER_STORAGE_KEY
            ) || "null"
        );
    } catch {
        return null;
    }
}

/* ==========================================================
    Payment Summary
   ========================================================== */

function renderPaymentInfo(payment) {
    if (!payment) {
        return "";
    }

    return `
        <hr>

        <h4>
            Payment Information
        </h4>

        <p>
            Method:
            <strong>
                ${escapeHtml(
                    payment.method || "N/A"
                )}
            </strong>
        </p>

        <p>
            Transaction:
            <strong>
                ${escapeHtml(
                    payment.transactionId || "N/A"
                )}
            </strong>
        </p>

        <p>
            Status:
            <strong>
                ${escapeHtml(
                    payment.status || "Unknown"
                )}
            </strong>
        </p>

        ${
            payment.cardLast4
                ? `
        <p>
            Card:
            <strong>
                **** **** **** ${escapeHtml(
                    payment.cardLast4
                )}
            </strong>
        </p>
        `
                : ""
        }
    `;
}

/* ==========================================================
    Order Items
   ========================================================== */

function renderOrderItems(items) {
    return items
        .map(item => {
            const total =
                item.price *
                item.quantity;

            return `
                <p>
                    ${item.quantity} ×
                    ${escapeHtml(
                        item.name
                    )}

                    <strong>
                        ${formatPrice(
                            total
                        )}
                    </strong>
                </p>
            `;
        })
        .join("");
}

/* ==========================================================
Main Summary Renderer
   ========================================================== */

function renderOrderSummary(order) {
    const summary =
        document.getElementById(
            "confirmationSummary"
        );

    if (!summary) return;

    summary.innerHTML = `
        <div class="order-summary-card">

            <h3>
                Order Summary
            </h3>

            ${renderOrderItems(
                order.items || []
            )}

            <hr>

            <p>
                Subtotal:
                <strong>
                    ${formatPrice(
                        order.subtotal
                    )}
                </strong>
            </p>

            <p>
                Shipping:
                <strong>
                    ${formatPrice(
                        order.shipping
                    )}
                </strong>
            </p>

            <p>
                Total:
                <strong>
                    ${formatPrice(
                        order.total
                    )}
                </strong>
            </p>

            ${renderPaymentInfo(
                order.payment
            )}

        </div>
    `;
}

/* ==========================================================
    Header Information
   ========================================================== */

function renderOrderHeader(order) {
    const orderNumber =
        document.getElementById(
            "orderNumber"
        );

    const orderStatus =
        document.getElementById(
            "orderStatus"
        );

    if (orderNumber) {
        orderNumber.textContent =
            order.id || "N/A";
    }

    if (orderStatus) {
        orderStatus.textContent =
            order.status ||
            "Unknown";
    }
}

/* ==========================================================
    Empty State
   ========================================================== */

function showMissingOrderMessage() {
    const summary =
        document.getElementById(
            "confirmationSummary"
        );

    if (!summary) return;

    summary.innerHTML = `
        <div class="order-summary-card">

            <h3>
                No Order Found
            </h3>

            <p>
                We could not find a recent order.
            </p>

            <a
                class="button"
                href="products.html"
            >
                Continue Shopping
            </a>

        </div>
    `;
}

/* ==========================================================
    Print Support
   ========================================================== */

function initPrintButton() {
    const button =
        document.getElementById(
            "printOrder"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        () => {
            window.print();
        }
    );
}

/* ==========================================================
    Invoice Hook
   ========================================================== */

function initInvoiceButton() {
    const button =
        document.getElementById(
            "downloadInvoice"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        () => {
            alert(
                "Invoice generation coming in ShopEase V3."
            );
        }
    );
}

/* ==========================================================
    Bootstrap
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const order =
            getLatestOrder();

        if (!order) {
            showMissingOrderMessage();
            return;
        }

        renderOrderHeader(
            order
        );

        renderOrderSummary(
            order
        );

        initPrintButton();

        initInvoiceButton();
    }
);