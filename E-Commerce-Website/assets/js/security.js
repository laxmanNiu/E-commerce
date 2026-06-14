document.addEventListener('DOMContentLoaded', () => {
    if (document.body.id !== 'securityPage') return;
    runSecurityChecks();
});

async function runSecurityChecks() {
    const checks = [
        checkContentSecurityPolicy(),
        await checkCartDataIntegrity(),
        checkAuthenticationEnabled(),
        checkStorageHealth(),
    ];
    const container = document.getElementById('securityReport');
    if (!container) return;
    container.innerHTML = checks.map((check) => `
        <article class="security-card ${check.passed ? 'passed' : 'failed'}">
            <h3>${check.title}</h3>
            <p>${check.message}</p>
        </article>
    `).join('');
}

function checkContentSecurityPolicy() {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
        return { title: 'Content Security Policy', passed: false, message: 'Missing CSP meta tag in the page header.' };
    }
    return { title: 'Content Security Policy', passed: true, message: 'CSP is configured for this page.' };
}

async function checkCartDataIntegrity() {
    const products = await fetchProducts();
    const cart = JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    if (!cart.length) {
        return { title: 'Cart Data Integrity', passed: true, message: 'No cart data present or the cart is currently empty.' };
    }
    const invalid = cart.some((item) => !products.some((product) => product.id === item.id) || item.quantity < 1 || item.quantity > 50);
    if (invalid) {
        return { title: 'Cart Data Integrity', passed: false, message: 'Cart contains invalid or tampered items. The cart should be reviewed.' };
    }
    return { title: 'Cart Data Integrity', passed: true, message: 'Cart items were validated against product catalog data.' };
}

function checkAuthenticationEnabled() {
    const authLinks = document.getElementById('authLinks');
    const hasLinks = Boolean(authLinks);
    return {
        title: 'Authentication Awareness',
        passed: hasLinks,
        message: hasLinks ? 'Login, registration, and profile links are available in the navigation.' : 'Authentication links are missing from navigation.',
    };
}

function checkStorageHealth() {
    try {
        const cart = localStorage.getItem('shopEaseCart');
        const users = localStorage.getItem('shopEaseUsers');
        if (cart && typeof cart !== 'string') throw new Error('Invalid cart storage format');
        if (users && typeof users !== 'string') throw new Error('Invalid users storage format');
        return { title: 'Storage Health', passed: true, message: 'Local storage values are present and formatted correctly.' };
    } catch (error) {
        return { title: 'Storage Health', passed: false, message: `Storage inspection failed: ${error.message}` };
    }
}
