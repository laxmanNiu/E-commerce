/* ==========================================================
ShopEase V2 Cart System
========================================================== */

const CART_KEY = "shopEaseCart";

const CART_CONFIG = {
MAX_ITEM_QUANTITY: 10,
MAX_CART_ITEMS: 20,
SHIPPING_COST: 5
};

/* ==========================================================
Cart Manager
========================================================== */

const CartManager = {
getCart() {
return JSON.parse(
localStorage.getItem(CART_KEY) || "[]"
);
},


saveCart(cart) {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    window.dispatchEvent(
        new Event("storage")
    );
},

clearCart() {
    this.saveCart([]);
},

getItem(productId) {
    return this.getCart().find(
        item => item.id === productId
    );
}


};

/* ==========================================================
Utilities
========================================================== */

function formatPrice(value) {
return `$${Number(value).toFixed(2)}`;
}

function sanitize(text) {
return String(text)
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">");
}

/* ==========================================================
Cart Rendering
========================================================== */

async function renderCart() {
const container =
document.getElementById(
"cartItems"
);


const subtotalEl =
    document.getElementById(
        "cartSubtotal"
    );

const totalEl =
    document.getElementById(
        "cartTotal"
    );

if (
    !container ||
    !subtotalEl ||
    !totalEl
) {
    return;
}

const products =
    await fetchProducts();

const productMap =
    new Map(
        products.map(product => [
            product.id,
            product
        ])
    );

let cart =
    CartManager.getCart();

cart = cart
    .filter(item =>
        productMap.has(item.id)
    )
    .map(item => ({
        id: item.id,
        quantity: Math.max(
            1,
            Math.min(
                item.quantity,
                CART_CONFIG.MAX_ITEM_QUANTITY
            )
        )
    }))
    .slice(
        0,
        CART_CONFIG.MAX_CART_ITEMS
    );

CartManager.saveCart(cart);

if (!cart.length) {
    container.innerHTML = `
        <p>
            Your cart is empty.
            Add some products to continue.
        </p>
    `;

    subtotalEl.textContent =
        formatPrice(0);

    totalEl.textContent =
        formatPrice(0);

    return;
}

let subtotal = 0;

container.innerHTML =
    cart
        .map(item => {
            const product =
                productMap.get(
                    item.id
                );

            const itemTotal =
                product.price *
                item.quantity;

            subtotal += itemTotal;

            return `
                <div class="cart-item">

                    <img
                        src="${product.image}"
                        alt="${sanitize(product.name)}"
                    >

                    <div class="item-details">

                        <h4>
                            ${sanitize(product.name)}
                        </h4>

                        <p>
                            ${formatPrice(product.price)}
                            ×
                            ${item.quantity}
                        </p>

                        <div class="item-actions">

                            <button
                                onclick="updateQuantity(${product.id}, ${
                item.quantity - 1
            })"
                            >
                                -
                            </button>

                            <button
                                onclick="updateQuantity(${product.id}, ${
                item.quantity + 1
            })"
                            >
                                +
                            </button>

                            <button
                                onclick="removeItem(${product.id})"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                </div>
            `;
        })
        .join("");

subtotalEl.textContent =
    formatPrice(subtotal);

totalEl.textContent =
    formatPrice(
        subtotal +
            CART_CONFIG.SHIPPING_COST
    );


}

/* ==========================================================
Quantity Management
========================================================== */

function updateQuantity(
productId,
newQuantity
) {
let cart =
CartManager.getCart();


const item = cart.find(
    item => item.id === productId
);

if (!item) return;

if (newQuantity < 1) {
    removeItem(productId);
    return;
}

item.quantity = Math.min(
    newQuantity,
    CART_CONFIG.MAX_ITEM_QUANTITY
);

CartManager.saveCart(cart);

renderCart();


}

function removeItem(productId) {
const cart =
CartManager
.getCart()
.filter(
item =>
item.id !== productId
);


CartManager.saveCart(cart);

renderCart();


}

/* ==========================================================
Cart Totals API
========================================================== */

function getCartCount() {
return CartManager.getCart()
.reduce(
(sum, item) =>
sum + item.quantity,
0
);
}

function getCartSubtotal(
products
) {
const productMap =
new Map(
products.map(p => [
p.id,
p
])
);


return CartManager.getCart()
    .reduce((total, item) => {
        const product =
            productMap.get(
                item.id
            );

        return (
            total +
            (product
                ? product.price *
                item.quantity
                : 0)
        );
    }, 0);


}

/* ==========================================================
Bootstrap
========================================================== */

document.addEventListener(
"DOMContentLoaded",
() => {
if (
document.body.id !==
"cartPage"
) {
return;
}


    renderCart();
}


);

window.updateQuantity =
updateQuantity;

window.removeItem =
removeItem;
