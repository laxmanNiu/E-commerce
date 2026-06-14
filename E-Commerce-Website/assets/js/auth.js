const USERS_KEY = 'shopEaseUsers';
const CURRENT_USER_KEY = 'shopEaseCurrentUser';
const ORDERS_KEY = 'shopEaseOrders';

function getStoredUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveStoredUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function sanitizeText(text) {
    return String(text).replace(/[<>]/g, (match) => (match === '<' ? '&lt;' : '&gt;'));
}

async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function publicUser(user) {
    return {
        name: user.name,
        email: user.email,
        registeredAt: user.registeredAt,
        orders: user.orders || []
    };
}

async function passwordMatches(user, password) {
    if (user.passwordHash) {
        return user.passwordHash === await hashPassword(password);
    }
    return user.password === password;
}

function renderAuthLinks() {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;
    const user = getCurrentUser();
    authLinks.innerHTML = '';
    if (user) {
        authLinks.innerHTML = `<a href="profile.html">Hi, ${sanitizeText(user.name)}</a><a href="#" id="logoutLink">Logout</a>`;
        const logoutLink = document.getElementById('logoutLink');
        logoutLink?.addEventListener('click', (event) => {
            event.preventDefault();
            logoutUser();
        });
    } else {
        authLinks.innerHTML = `<a href="login.html">Login</a><a href="register.html">Register</a>`;
    }
}

function logoutUser() {
    clearCurrentUser();
    renderAuthLinks();
    window.dispatchEvent(new Event('storage'));
    if (document.body.id === 'profilePage') {
        window.location.href = 'login.html';
    }
}

function saveOrderForUser(order) {
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    allOrders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
    const user = getCurrentUser();
    if (user) {
        user.orders = user.orders || [];
        user.orders.push(order.id);
        setCurrentUser(user);
    }
}

function initLoginPage() {
    const form = document.getElementById('loginForm');
    const message = document.getElementById('authMessage');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value.trim();
        const users = getStoredUsers();
        const user = users.find((item) => item.email === email);
        const isValid = user ? await passwordMatches(user, password) : false;
        if (!isValid) {
            message.textContent = 'Invalid email or password. Please try again.';
            message.className = 'error-message';
            return;
        }
        if (!user.passwordHash) {
            user.passwordHash = await hashPassword(password);
            delete user.password;
            saveStoredUsers(users);
        }
        setCurrentUser(publicUser(user));
        renderAuthLinks();
        window.location.href = 'profile.html';
    });
}

function initRegisterPage() {
    const form = document.getElementById('registerForm');
    const message = document.getElementById('authMessage');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim().toLowerCase();
        const password = document.getElementById('registerPassword').value.trim();
        const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
        if (!name || !email || !password || !confirmPassword) {
            message.textContent = 'Please fill out every field.';
            message.className = 'error-message';
            return;
        }
        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            message.className = 'error-message';
            return;
        }
        const users = getStoredUsers();
        if (users.some((item) => item.email === email)) {
            message.textContent = 'An account with that email already exists.';
            message.className = 'error-message';
            return;
        }
        const user = {
            name: sanitizeText(name),
            email,
            passwordHash: await hashPassword(password),
            registeredAt: new Date().toISOString(),
            orders: []
        };
        users.push(user);
        saveStoredUsers(users);
        setCurrentUser(publicUser(user));
        renderAuthLinks();
        window.location.href = 'profile.html';
    });
}

function initProfilePage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRegistered = document.getElementById('profileRegistered');
    const orderHistory = document.getElementById('orderHistory');
    if (profileName) profileName.textContent = sanitizeText(user.name);
    if (profileEmail) profileEmail.textContent = sanitizeText(user.email);
    if (profileRegistered) profileRegistered.textContent = new Date(user.registeredAt).toLocaleDateString();
    const storedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const userOrders = storedOrders.filter((order) => order.customer?.email === user.email || (user.orders || []).includes(order.id));

    if (!orderHistory) return;
    if (!userOrders.length) {
        orderHistory.innerHTML = '<p>No orders yet. Start shopping to create your first order.</p>';
        return;
    }
    orderHistory.innerHTML = userOrders.map((order) => `
        <article class="order-card">
            <h4>Order ${sanitizeText(order.id)}</h4>
            <p>Status: <strong>${sanitizeText(order.status)}</strong></p>
            <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
            <p>Placed on: <strong>${new Date(order.createdAt).toLocaleString()}</strong></p>
            <div class="order-items">${order.items.map((item) => `<p>${item.quantity}× ${sanitizeText(item.name)} — $${(item.price * item.quantity).toFixed(2)}</p>`).join('')}</div>
        </article>
    `).join('');
}

function initAuth() {
    window.addEventListener('componentsLoaded', renderAuthLinks);
    window.addEventListener('storage', renderAuthLinks);
    document.addEventListener('DOMContentLoaded', () => {
        const pageId = document.body.id;
        if (pageId === 'loginPage') initLoginPage();
        if (pageId === 'registerPage') initRegisterPage();
        if (pageId === 'profilePage') initProfilePage();
    });
}

initAuth();
