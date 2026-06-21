/* ==========================================================
    ShopEase V2 Main Application
   ========================================================== */

const APP_CONFIG = {
    PRODUCTS_URL: "assets/data/products.json",

    COMPONENTS: [
        {
            url: "components/navbar.html",
            target: "navbar-placeholder"
        },
        {
            url: "components/footer.html",
            target: "footer-placeholder"
        },
        {
            url: "components/scroll-top.html",
            target: "scroll-top-placeholder"
        }
    ]
};

const APP_CACHE = {
    products: null,
    components: new Map()
};

/* ==========================================================
    Utilities
   ========================================================== */

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function dispatchComponentsLoaded() {
    document.dispatchEvent(
        new Event("componentsLoaded")
    );
}

/* ==========================================================
    Component Loader
   ========================================================== */

async function loadComponent(
    url,
    targetId
) {
    try {
        const target =
            document.getElementById(
                targetId
            );

        if (!target) return;

        let html =
            APP_CACHE.components.get(
                url
            );

        if (!html) {
            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to load ${url}`
                );
            }

            html =
                await response.text();

            APP_CACHE.components.set(
                url,
                html
            );
        }

        target.innerHTML = html;
    } catch (error) {
        console.warn(
            "Component load failed:",
            url,
            error
        );
    }
}

async function loadComponents() {
    await Promise.all(
        APP_CONFIG.COMPONENTS.map(
            component =>
                loadComponent(
                    component.url,
                    component.target
                )
        )
    );
}

/* ==========================================================
    Dynamic Script Loader
   ========================================================== */

function loadScript(src) {
    return new Promise(
        (resolve, reject) => {
            if (
                document.querySelector(
                    `script[src="${src}"]`
                )
            ) {
                resolve();
                return;
            }

            const script =
                document.createElement(
                    "script"
                );

            script.src = src;
            script.defer = true;

            script.onload =
                resolve;

            script.onerror = () =>
                reject(
                    new Error(
                        `Failed to load ${src}`
                    )
                );

            document.body.appendChild(
                script
            );
        }
    );
}

/* ==========================================================
    Page Scripts
   ========================================================== */

function getPageScripts() {
    const pageId =
        document.body.id;

    return {
        productsPage: [
            "assets/js/products-v2.js"
        ],

        productDetailsPage: [
            "assets/js/products-v2.js"
        ],

        categoriesPage: [
            "assets/js/products-v2.js"
        ],

        cartPage: [
            "assets/js/cart-v2.js"
        ],

        checkoutPage: [
            "assets/js/checkout-v2.js"
        ],

        contactPage: [
            "assets/js/contact-v2.js"
        ],

        loginPage: [
            "assets/js/auth-v2.js"
        ],

        registerPage: [
            "assets/js/auth-v2.js"
        ],

        profilePage: [
            "assets/js/auth-v2.js"
        ],

        securityPage: [
            "assets/js/security.js",
            "assets/js/auth-v2.js"
        ],

        orderConfirmationPage: [
            "assets/js/order-confirmation.js",
            "assets/js/auth-v2.js"
        ]
    }[pageId] || [];
}

async function loadPageScripts() {
    const scripts =
        getPageScripts();

    await Promise.all(
        scripts.map(loadScript)
    );
}

/* ==========================================================
    Product API
   ========================================================== */

async function fetchProducts() {
    if (
        APP_CACHE.products
    ) {
        return APP_CACHE.products;
    }

    try {
        const response =
            await fetch(
                APP_CONFIG.PRODUCTS_URL
            );

        if (!response.ok) {
            throw new Error(
                "Product fetch failed"
            );
        }

        APP_CACHE.products =
            await response.json();

        return APP_CACHE.products;
    } catch (error) {
        console.error(
            error
        );

        return [];
    }
}

window.fetchProducts =
    fetchProducts;

/* ==========================================================
    Navigation
   ========================================================== */

function initNavToggle() {
    document.addEventListener(
        "click",
        event => {
            if (
                event.target.id !==
                "navToggle"
            ) {
                return;
            }

            const nav =
                document.querySelector(
                    "nav.main-nav"
                );

            nav?.classList.toggle(
                "open"
            );
        }
    );
}

/* ==========================================================
    Scroll To Top
   ========================================================== */

function initScrollToTop() {
    const button =
        document.getElementById(
            "scrollTop"
        );

    if (!button) return;

    window.addEventListener(
        "scroll",
        () => {
            button.style.display =
                window.scrollY >
                300
                    ? "flex"
                    : "none";
        }
    );

    button.addEventListener(
        "click",
        () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}

/* ==========================================================
    Hero Slider
   ========================================================== */

function initHeroSlider() {
    const slides =
        document.querySelectorAll(
            ".hero-slider .slide"
        );

    if (!slides.length) return;

    let current = 0;

    setInterval(() => {
        slides[
            current
        ].classList.remove(
            "active"
        );

        current =
            (current + 1) %
            slides.length;

        slides[
            current
        ].classList.add(
            "active"
        );
    }, 5000);
}

/* ==========================================================
    Featured Products
   ========================================================== */

function productCard(product) {
    const stars = "★".repeat(
        Math.round(
            product.rating || 0
        )
    );

    return `
    <article class="product-card">

        <img
            src="${product.image}"
            alt="${escapeHtml(product.name)}"
        >

        <div class="card-meta">
            <span class="badge">
                ${escapeHtml(product.category)}
            </span>

            <span class="seller">
                Sold by
                ${escapeHtml(
                    product.seller ||
                    "ShopEase"
                )}
            </span>
        </div>

        <h4>
            ${escapeHtml(product.name)}
        </h4>

        <p class="price">
            $${product.price.toFixed(2)}
        </p>

        <div class="rating">
            ${stars}
            <span>
                ${product.rating}
            </span>
        </div>

        <a
            class="button"
            href="product-details.html?id=${product.id}"
        >
            View Details
        </a>

    </article>
    `;
}

async function loadFeaturedProducts() {
    const container =
        document.getElementById(
            "featuredProducts"
        );

    if (!container) return;

    const products =
        await fetchProducts();

    container.innerHTML =
        products
            .slice(0, 4)
            .map(productCard)
            .join("");
}

/* ==========================================================
    Cart Badge
   ========================================================== */

function getCartCount() {
    const cart =
        JSON.parse(
            localStorage.getItem(
                "shopEaseCart"
            ) || "[]"
        );

    return cart.reduce(
        (sum, item) =>
            sum + item.quantity,
        0
    );
}

function updateCartLink() {
    const nav =
        document.querySelector(
            "nav.main-nav"
        );

    if (!nav) return;

    const count =
        getCartCount();

    let badge =
        document.getElementById(
            "cartCount"
        );

    if (!badge) {
        const cartLink =
            [...nav.querySelectorAll("a")]
                .find(link =>
                    link.href.includes(
                        "cart.html"
                    )
                );

        if (!cartLink) return;

        badge =
            document.createElement(
                "span"
            );

        badge.id =
            "cartCount";

        badge.style.marginLeft =
            "8px";

        badge.style.color =
            "#4f46e5";

        cartLink.appendChild(
            badge
        );
    }

    badge.textContent =
        count;
}

/* ==========================================================
    Home Features
   ========================================================== */

function loadPageFeatures() {
    if (
        document.body.id ===
        "home"
    ) {
        initHeroSlider();
        loadFeaturedProducts();
    }
}

/* ==========================================================
    App Bootstrap
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        await loadComponents();

        initNavToggle();

        initScrollToTop();

        await loadScript(
            "assets/js/auth-v2.js"
        );

        dispatchComponentsLoaded();

        loadPageFeatures();

        await loadPageScripts();

        updateCartLink();
    }
);

window.addEventListener(
    "storage",
    updateCartLink
);

window.addEventListener(
    "load",
    updateCartLink
);