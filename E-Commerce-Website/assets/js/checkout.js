/* ==========================================================
    ShopEase V2 Checkout System
   ========================================================== */

const CHECKOUT_CONFIG = {
    MAX_ITEM_QUANTITY: 10,
    SHIPPING_COST: 5
};

const STORAGE_KEYS = {
    CART: "shopEaseCart",
    LATEST_ORDER: "shopEaseLatestOrder"
};

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

function getCart() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CART) || "[]"
    );
}

function saveCart(cart) {
    localStorage.setItem(
        STORAGE_KEYS.CART,
        JSON.stringify(cart)
    );
}

function generateOrderId() {
    return (
        "ORD-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9\-\s()+]{7,20}$/.test(phone);
}

function validatePostal(postal) {
    return /^[0-9]{4,10}$/.test(postal);
}

/* ==========================================================
    Cart Validation
   ========================================================== */

async function getValidatedCart() {
    const products = await fetchProducts();

    const productMap = new Map(
        products.map(product => [
            product.id,
            product
        ])
    );

    const cart = getCart();

    return cart
        .filter(item =>
            productMap.has(item.id)
        )
        .map(item => ({
            product: productMap.get(item.id),
            quantity: Math.max(
                1,
                Math.min(
                    item.quantity,
                    CHECKOUT_CONFIG.MAX_ITEM_QUANTITY
                )
            )
        }));
}

/* ==========================================================
    Checkout Summary
   ========================================================== */

async function renderCheckoutSummary() {
    const container =
        document.getElementById(
            "checkoutSummary"
        );

    if (!container) return;

    const cart =
        await getValidatedCart();

    if (!cart.length) {
        container.innerHTML = `
            <p>Your cart is empty.</p>
        `;
        return;
    }

    let subtotal = 0;

    const lines = cart
        .map(item => {
            const itemTotal =
                item.product.price *
                item.quantity;

            subtotal += itemTotal;

            return `
                <p>
                    ${item.quantity} ×
                    ${escapeHtml(
                        item.product.name
                    )}
                    <strong>
                        ${formatPrice(
                            itemTotal
                        )}
                    </strong>
                </p>
            `;
        })
        .join("");

    const total =
        subtotal +
        CHECKOUT_CONFIG.SHIPPING_COST;

    container.innerHTML = `
        ${lines}
        <hr>

        <p>
            Subtotal:
            <strong>
                ${formatPrice(
                    subtotal
                )}
            </strong>
        </p>

        <p>
            Shipping:
            <strong>
                ${formatPrice(
                    CHECKOUT_CONFIG.SHIPPING_COST
                )}
            </strong>
        </p>

        <p>
            Total:
            <strong>
                ${formatPrice(total)}
            </strong>
        </p>
    `;
}

/* ==========================================================
    Form Validation
   ========================================================== */

function getCustomerData() {
    return {
        name: document
            .getElementById(
                "customerName"
            )
            .value.trim(),

        email: document
            .getElementById(
                "customerEmail"
            )
            .value.trim(),

        phone: document
            .getElementById(
                "customerPhone"
            )
            .value.trim(),

        address: document
            .getElementById(
                "customerAddress"
            )
            .value.trim(),

        city: document
            .getElementById(
                "customerCity"
            )
            .value.trim(),

        state: document
            .getElementById(
                "customerState"
            )
            .value.trim(),

        postal: document
            .getElementById(
                "customerPostal"
            )
            .value.trim()
    };
}

function validateCheckoutForm() {
    const customer =
        getCustomerData();

    if (
        !customer.name ||
        !customer.email ||
        !customer.phone ||
        !customer.address ||
        !customer.city ||
        !customer.state ||
        !customer.postal
    ) {
        alert(
            "Please complete all checkout fields."
        );
        return false;
    }

    if (
        !validateEmail(
            customer.email
        )
    ) {
        alert(
            "Please enter a valid email."
        );
        return false;
    }

    if (
        !validatePhone(
            customer.phone
        )
    ) {
        alert(
            "Please enter a valid phone number."
        );
        return false;
    }

    if (
        !validatePostal(
            customer.postal
        )
    ) {
        alert(
            "Please enter a valid postal code."
        );
        return false;
    }

    return true;
}

/* ==========================================================
    Mock Payment Modal
   ========================================================== */

let paymentPromiseResolver = null;

function injectPaymentStyles() {
    if (
        document.getElementById(
            "mockPaymentStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "mockPaymentStyles";

    style.textContent = `
    #mockPaymentModal{
        position:fixed;
        inset:0;
        z-index:9999;
    }

    .mock-modal-backdrop{
        position:absolute;
        inset:0;
        display:flex;
        justify-content:center;
        align-items:center;
        background:rgba(0,0,0,.6);
    }

    .mock-modal{
        background:#fff;
        width:95%;
        max-width:420px;
        border-radius:12px;
        padding:20px;
    }

    .mock-modal label{
        display:block;
        margin-bottom:10px;
    }

    .mock-modal input{
        width:100%;
        padding:8px;
        margin-top:5px;
    }

    .mock-actions{
        display:flex;
        gap:10px;
        justify-content:flex-end;
        margin-top:15px;
    }
    `;

    document.head.appendChild(style);
}