document.addEventListener('DOMContentLoaded', () => {
    if (document.body.id !== 'contactPage') return;
    const form = document.getElementById('contactForm');
    const success = document.getElementById('contactSuccess');
    const error = document.getElementById('contactError');
    const validateForm = () => {
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name || !email || !subject || !message) {
            error.textContent = 'Please complete all fields.';
            success.textContent = '';
            return false;
        }
        if (!emailPattern.test(email)) {
            error.textContent = 'Please enter a valid email address.';
            success.textContent = '';
            return false;
        }
        error.textContent = '';
        return true;
    };
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        success.textContent = 'Thank you! We received your message and will get back to you soon.';
        error.textContent = '';
        form.reset();
    });
    if (window.jQuery) {
        $('#contactForm').on('submit', function (event) {
            event.preventDefault();
            if (!validateForm()) return;
        });
    }
});
