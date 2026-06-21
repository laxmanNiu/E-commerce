const STORAGE = {
USERS: "shopEaseUsers",
CURRENT_USER: "shopEaseCurrentUser",
ORDERS: "shopEaseOrders"
};

const AUTH = {
SESSION_HOURS: 24,
PASSWORD_MIN_LENGTH: 8
};

/* =========================
Storage Helpers
========================= */

const Storage = {
get(key, fallback = null) {
try {
return JSON.parse(localStorage.getItem(key)) ?? fallback;
} catch {
return fallback;
}
},


set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
},

remove(key) {
    localStorage.removeItem(key);
}


};

/* =========================
Security Helpers
========================= */

function sanitize(text) {
return String(text)
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">");
}

function validateEmail(email) {
return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email);
}

function validatePassword(password) {
return (
password.length >= AUTH.PASSWORD_MIN_LENGTH &&
/[A-Z]/.test(password) &&
/[a-z]/.test(password) &&
/\d/.test(password)
);
}

async function hashPassword(password) {
const data = new TextEncoder().encode(password);


const digest = await crypto.subtle.digest(
    "SHA-256",
    data
);

return Array.from(
    new Uint8Array(digest)
)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");


}

/* =========================
User Management
========================= */

function getUsers() {
return Storage.get(STORAGE.USERS, []);
}

function saveUsers(users) {
Storage.set(STORAGE.USERS, users);
}

function getCurrentUser() {
const user = Storage.get(
STORAGE.CURRENT_USER,
null
);


if (!user) return null;

if (
    user.sessionExpiry &&
    Date.now() > user.sessionExpiry
) {
    logoutUser();
    return null;
}

return user;


}

function setCurrentUser(user) {
Storage.set(
STORAGE.CURRENT_USER,
{
...user,
sessionExpiry:
Date.now() +
AUTH.SESSION_HOURS *
60 *
60 *
1000
}
);
}

function clearCurrentUser() {
Storage.remove(STORAGE.CURRENT_USER);
}

function publicUser(user) {
return {
name: user.name,
email: user.email,
registeredAt: user.registeredAt,
orders: user.orders || []
};
}

/* =========================
Auth Navbar
========================= */

function renderAuthLinks() {
const authLinks =
document.getElementById(
"authLinks"
);


if (!authLinks) return;

const user = getCurrentUser();
if (!user) {
    authLinks.innerHTML = `
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
    `;
    return;
}

authLinks.innerHTML = `
    <a href="profile.html">
        Hi, ${sanitize(user.name)}
    </a>
    <a href="#" id="logoutLink">
        Logout
    </a>
`;

document
    .getElementById("logoutLink")
    ?.addEventListener(
        "click",
        event => {
            event.preventDefault();
            logoutUser();
        }
    );


}

function logoutUser() {
clearCurrentUser();


window.dispatchEvent(
    new Event("storage")
);

renderAuthLinks();

if (
    document.body.id ===
    "profilePage"
) {
    location.href =
        "login.html";
}


}

/* =========================
Orders
========================= */

function saveOrderForUser(order) {
const orders = Storage.get(
STORAGE.ORDERS,
[]
);

orders.push(order);

Storage.set(
    STORAGE.ORDERS,
    orders
);

const user =
    getCurrentUser();

if (!user) return;

user.orders =
    user.orders || [];

user.orders.push(order.id);

setCurrentUser(user);


}

/* =========================
Login Page
========================= */

function initLoginPage() {
const form =
document.getElementById(
"loginForm"
);


const msg =
    document.getElementById(
        "authMessage"
    );

if (!form) return;

form.addEventListener(
    "submit",
    async e => {
        e.preventDefault();

        const email =
            document
                .getElementById(
                    "loginEmail"
                )
                .value.trim()
                .toLowerCase();

        const password =
            document.getElementById(
                "loginPassword"
            ).value;

        const users =
            getUsers();

        const user =
            users.find(
                u =>
                    u.email ===
                    email
            );

        if (!user) {
            msg.textContent =
                "Invalid email or password.";
            return;
        }

        const hashed =
            await hashPassword(
                password
            );

        if (
            user.passwordHash !==
            hashed
        ) {
            msg.textContent =
                "Invalid email or password.";
            return;
        }

        setCurrentUser(
            publicUser(user)
        );

        location.href =
            "profile.html";
    }
);

}

/* =========================
Register Page
========================= */

function initRegisterPage() {
const form =
document.getElementById(
"registerForm"
);


const msg =
    document.getElementById(
        "authMessage"
    );

if (!form) return;

form.addEventListener(
    "submit",
    async e => {
        e.preventDefault();

        const name =
            document
                .getElementById(
                    "registerName"
                )
                .value.trim();

        const email =
            document
                .getElementById(
                    "registerEmail"
                )
                .value.trim()
                .toLowerCase();

        const password =
            document.getElementById(
                "registerPassword"
            ).value;

        const confirm =
            document.getElementById(
                "registerConfirmPassword"
            ).value;

        if (
            !name ||
            !email ||
            !password
        ) {
            msg.textContent =
                "All fields are required.";
            return;
        }

        if (
            !validateEmail(
                email
            )
        ) {
            msg.textContent =
                "Invalid email address.";
            return;
        }

        if (
            !validatePassword(
                password
            )
        ) {
            msg.textContent =
                "Password must contain uppercase, lowercase and a number.";
            return;
        }

        if (
            password !==
            confirm
        ) {
            msg.textContent =
                "Passwords do not match.";
            return;
        }

        const users =
            getUsers();

        if (
            users.some(
                u =>
                    u.email ===
                    email
            )
        ) {
            msg.textContent =
                "Email already registered.";
            return;
        }

        const user = {
            id:
                crypto.randomUUID(),
            name:
                sanitize(name),
            email,
            passwordHash:
                await hashPassword(
                    password
                ),
            registeredAt:
                new Date().toISOString(),
            orders: []
        };

        users.push(user);

        saveUsers(users);

        setCurrentUser(
            publicUser(user)
        );

        location.href =
            "profile.html";
    }
);


}

/* =========================
Profile Page
========================= */

function initProfilePage() {
const user =
getCurrentUser();


if (!user) {
    location.href =
        "login.html";
    return;
}

document.getElementById(
    "profileName"
).textContent =
    user.name;

document.getElementById(
    "profileEmail"
).textContent =
    user.email;

document.getElementById(
    "profileRegistered"
).textContent =
    new Date(
        user.registeredAt
    ).toLocaleDateString();

const history =
    document.getElementById(
        "orderHistory"
    );

if (!history) return;

const orders =
    Storage.get(
        STORAGE.ORDERS,
        []
    );

const userOrders =
    orders.filter(
        o =>
            o.customer
                ?.email ===
                user.email
    );

if (
    !userOrders.length
) {
    history.innerHTML =
        "<p>No orders found.</p>";
    return;
}

history.innerHTML =
    userOrders
        .map(
            order =>
    <article class="order-card">
        <h4>Order ${sanitize(order.id)}</h4>
        <p>Status:
            <strong>
                ${sanitize(order.status)}
            </strong>
        </p>
        <p>Total:
            <strong>
                $${Number(order.total).toFixed(2)}
            </strong>
        </p>
    </article>

        )
        .join("");


}

/* =========================
Bootstrap
========================= */

function initAuth() {
window.addEventListener(
"storage",
renderAuthLinks
);


document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderAuthLinks();

        switch (
            document.body.id
        ) {
            case "loginPage":
                initLoginPage();
                break;

            case "registerPage":
                initRegisterPage();
                break;

            case "profilePage":
                initProfilePage();
                break;
        }
    }
);


}

initAuth();
