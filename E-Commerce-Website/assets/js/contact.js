/* ==========================================================
    ShopEase V2 Contact System
   ========================================================== */

const CONTACT_CONFIG = {
    MAX_NAME_LENGTH: 100,
    MAX_SUBJECT_LENGTH: 150,
    MAX_MESSAGE_LENGTH: 2000,
    STORAGE_KEY: "shopEaseContactMessages"
};

/* ==========================================================
    Utilities
   ========================================================== */

function sanitize(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    const error =
        document.getElementById("contactError");

    const success =
        document.getElementById("contactSuccess");

    if (error) error.textContent = message;
    if (success) success.textContent = "";
}

function showSuccess(message) {
    const error =
        document.getElementById("contactError");

    const success =
        document.getElementById("contactSuccess");

    if (success) success.textContent = message;
    if (error) error.textContent = "";
}

function getStoredMessages() {
    return JSON.parse(
        localStorage.getItem(
            CONTACT_CONFIG.STORAGE_KEY
        ) || "[]"
    );
}

function saveMessage(message) {
    const messages =
        getStoredMessages();

    messages.push(message);

    localStorage.setItem(
        CONTACT_CONFIG.STORAGE_KEY,
        JSON.stringify(messages)
    );
}

/* ==========================================================
    Form Data
   ========================================================== */

function getFormData() {
    return {
        name: document
            .getElementById("contactName")
            .value.trim(),

        email: document
            .getElementById("contactEmail")
            .value.trim(),

        subject: document
            .getElementById("contactSubject")
            .value.trim(),

        message: document
            .getElementById("contactMessage")
            .value.trim()
    };
}

/* ==========================================================
    Validation
   ========================================================== */

function validateForm(data) {
    if (
        !data.name ||
        !data.email ||
        !data.subject ||
        !data.message
    ) {
        showError(
            "Please complete all fields."
        );
        return false;
    }

    if (
        data.name.length >
        CONTACT_CONFIG.MAX_NAME_LENGTH
    ) {
        showError(
            "Name is too long."
        );
        return false;
    }

    if (
        data.subject.length >
        CONTACT_CONFIG.MAX_SUBJECT_LENGTH
    ) {
        showError(
            "Subject is too long."
        );
        return false;
    }

    if (
        data.message.length >
        CONTACT_CONFIG.MAX_MESSAGE_LENGTH
    ) {
        showError(
            "Message is too long."
        );
        return false;
    }

    if (
        !validateEmail(data.email)
    ) {
        showError(
            "Please enter a valid email address."
        );
        return false;
    }

    return true;
}

/* ==========================================================
    Form Submit
   ========================================================== */

function handleSubmit(event) {
    event.preventDefault();

    const formData =
        getFormData();

    if (
        !validateForm(formData)
    ) {
        return;
    }

    const contactRecord = {
        id:
            "MSG-" +
            Date.now(),
        name:
            sanitize(
                formData.name
            ),
        email:
            sanitize(
                formData.email
            ),
        subject:
            sanitize(
                formData.subject
            ),
        message:
            sanitize(
                formData.message
            ),
        createdAt:
            new Date().toISOString(),
        status: "New"
    };

    saveMessage(
        contactRecord
    );

    showSuccess(
        "Thank you! We received your message and will get back to you soon."
    );

    document
        .getElementById(
            "contactForm"
        )
        .reset();
}

/* ==========================================================
    Bootstrap
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            document.body.id !==
            "contactPage"
        ) {
            return;
        }

        const form =
            document.getElementById(
                "contactForm"
            );

        if (!form) return;

        form.addEventListener(
            "submit",
            handleSubmit
        );
    }
);