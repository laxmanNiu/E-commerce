document.addEventListener('DOMContentLoaded', () => {
if (document.body.id !== 'securityPage') return;
runSecurityChecks();
});

async function runSecurityChecks() {


const checks = await Promise.all([
    Promise.resolve(checkContentSecurityPolicy()),
    checkCartDataIntegrity(),
    Promise.resolve(checkAuthenticationEnabled()),
    Promise.resolve(checkStorageHealth()),
    Promise.resolve(checkWishlistIntegrity()),
    Promise.resolve(checkSessionSecurity()),
    Promise.resolve(checkHttpsUsage()),
    Promise.resolve(checkPasswordStorage())
]);

const container =
    document.getElementById('securityReport');

const scoreElement =
    document.getElementById('securityScore');

if (!container) return;

const passedChecks =
    checks.filter(
        check => check.passed
    ).length;

const score =
    Math.round(
        (passedChecks / checks.length) * 100
    );

if (scoreElement) {
    scoreElement.textContent =
        `${score}%`;
}

container.innerHTML =
    checks.map(check => `
        <article
            class="security-card ${check.passed ? 'passed' : 'failed'}">

            <h3>
                ${check.passed ? '✅' : '❌'}
                ${check.title}
            </h3>

            <p>
                ${check.message}
            </p>

        </article>
    `).join('');


}

function checkContentSecurityPolicy() {


const meta =
    document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
    );

if (!meta) {

    return {
        title: 'Content Security Policy',
        passed: false,
        message:
            'CSP header or meta tag is missing.'
    };
}

return {
    title: 'Content Security Policy',
    passed: true,
    message:
        'Content Security Policy detected.'
};


}

async function checkCartDataIntegrity() {


try {

    const products =
        await fetchProducts();

    const cart =
        JSON.parse(
            localStorage.getItem(
                'shopEaseCart'
            ) || '[]'
        );

    if (!cart.length) {

        return {
            title: 'Cart Data Integrity',
            passed: true,
            message:
                'Cart is currently empty.'
        };
    }

    const invalid =
        cart.some(item => {

            const productExists =
                products.some(
                    product =>
                        product.id === item.id
                );

            return (
                !productExists ||
                item.quantity < 1 ||
                item.quantity > 50
            );
        });

    return invalid
        ? {
            title: 'Cart Data Integrity',
            passed: false,
            message:
                'Cart contains invalid items.'
        }
        : {
            title: 'Cart Data Integrity',
            passed: true,
            message:
                'Cart validation passed.'
        };

} catch {

    return {
        title: 'Cart Data Integrity',
        passed: false,
        message:
            'Unable to verify cart.'
    };
}


}

function checkAuthenticationEnabled() {


const authLinks =
    document.getElementById(
        'authLinks'
    );

return {
    title: 'Authentication System',
    passed: !!authLinks,
    message: authLinks
        ? 'Authentication links detected.'
        : 'Authentication navigation missing.'
};


}

function checkStorageHealth() {


try {

    const cart =
        localStorage.getItem(
            'shopEaseCart'
        );

    const users =
        localStorage.getItem(
            'shopEaseUsers'
        );

    const wishlist =
        localStorage.getItem(
            'shopEaseWishlist'
        );

    if (
        cart &&
        typeof cart !== 'string'
    ) {
        throw new Error(
            'Invalid cart storage.'
        );
    }

    if (
        users &&
        typeof users !== 'string'
    ) {
        throw new Error(
            'Invalid users storage.'
        );
    }

    if (
        wishlist &&
        typeof wishlist !== 'string'
    ) {
        throw new Error(
            'Invalid wishlist storage.'
        );
    }

    return {
        title: 'Storage Health',
        passed: true,
        message:
            'Storage values look valid.'
    };

} catch (error) {

    return {
        title: 'Storage Health',
        passed: false,
        message: error.message
    };
}


}

function checkWishlistIntegrity() {


try {

    const wishlist =
        JSON.parse(
            localStorage.getItem(
                'shopEaseWishlist'
            ) || '[]'
        );

    const valid =
        Array.isArray(wishlist);

    return {
        title: 'Wishlist Integrity',
        passed: valid,
        message: valid
            ? 'Wishlist structure is valid.'
            : 'Wishlist data is corrupted.'
    };

} catch {

    return {
        title: 'Wishlist Integrity',
        passed: false,
        message:
            'Wishlist data could not be read.'
    };
}


}

function checkSessionSecurity() {


const currentUser =
    localStorage.getItem(
        'shopEaseCurrentUser'
    );

return {
    title: 'Session Security',
    passed: !!currentUser,
    message: currentUser
        ? 'User session detected.'
        : 'No active session found.'
};


}

function checkHttpsUsage() {


const secure =
    location.protocol === 'https:'
    || location.hostname === 'localhost'
    || location.hostname === '127.0.0.1';

return {
    title: 'HTTPS Protection',
    passed: secure,
    message: secure
        ? 'Connection is secure.'
        : 'HTTPS is not enabled.'
};


}

function checkPasswordStorage() {


try {

    const users =
        JSON.parse(
            localStorage.getItem(
                'shopEaseUsers'
            ) || '[]'
        );

    if (!users.length) {

        return {
            title: 'Password Storage',
            passed: true,
            message:
                'No users stored locally.'
        };
    }

    const weakStorage =
        users.some(
            user =>
                user.password
        );

    return {
        title: 'Password Storage',
        passed: !weakStorage,
        message: weakStorage
            ? 'Plain text passwords detected.'
            : 'Passwords appear protected.'
    };

} catch {

    return {
        title: 'Password Storage',
        passed: false,
        message:
            'Unable to inspect password storage.'
    };
}


}

function showSecurityToast(message) {


const toast =
    document.createElement('div');

toast.className =
    'toast-notification';

toast.textContent =
    message;

document.body.appendChild(
    toast
);

setTimeout(() => {
    toast.remove();
}, 3000);


}
