// LOGIN

function handleLogin() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var btn = document.querySelector('.login-submit-btn');
    var errorEl = document.getElementById('login-error');

    errorEl.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Logging in…'; }

    var formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    fetch('php/login.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                window.location.href = 'admin.html';
            } else {
                errorEl.textContent = data.message;
                if (btn) { btn.disabled = false; btn.textContent = 'Login to Dashboard'; }
            }
        })
        .catch(function() {
            errorEl.textContent = 'Something went wrong. Try again.';
            if (btn) { btn.disabled = false; btn.textContent = 'Login to Dashboard'; }
        });
}


function handleLogout() {
    fetch('php/logout.php').then(function() {
        window.location.href = 'login.html';
    });
}


// VOLUNTEER FORM
function handleVolunteer() {
    var name  = document.getElementById('vol-name').value.trim();
    var id    = document.getElementById('vol-id').value.trim();
    var dept  = document.getElementById('vol-dept').value.trim();
    var phone = document.getElementById('vol-phone').value.trim();
    var email = document.getElementById('vol-email').value.trim();
    var event = document.getElementById('vol-event').value;

    if (!name || !id || !dept || !email || !phone || !event) {
        alert('Please fill in all fields before submitting.');
        return;
    }

    var btn = document.querySelector('.volunteer-btn');
    var originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

    var formData = new FormData();
    formData.append('name', name);
    formData.append('student_id', id);
    formData.append('department', dept);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('preferred_event', event);

    fetch('php/volunteers/create.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                document.getElementById('volunteer-form').style.display    = 'none';
                document.getElementById('volunteer-success').style.display = 'flex';
            } else {
                alert('Error: ' + data.message);
                if (btn) { btn.disabled = false; btn.textContent = originalText; }
            }
        })
        .catch(function() {
            alert('Something went wrong. Please check your connection and try again.');
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        });
}

// CONTACT FORM


function handleContact() {
    var name    = document.getElementById('contact-name').value.trim();
    var email   = document.getElementById('contact-email').value.trim();
    var subject = document.getElementById('contact-subject').value.trim();
    var message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields before sending.');
        return;
    }

    var btn = document.querySelector('.contact-btn');
    var originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    var formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('message', message);

    fetch('php/contact/create.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                document.getElementById('contact-form').style.display = 'none';
                document.getElementById('contact-success').style.display = 'flex';
            } else {
                alert('Error: ' + data.message);
                if (btn) { btn.disabled = false; btn.textContent = originalText; }
            }
        })
        .catch(function() {
            alert('Something went wrong. Please check your connection and try again.');
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        });
}

// EVENTS FILTER
function filterEvents(category) {
    const cards = document.querySelectorAll('.event-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// GALLERY FILTER
function filterGallery(category, btn) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.gallery-filter .filter-btn');

    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// NAVBAR HIDE ON SCROLL
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function () {
    if (!navbar) return;

    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// NEWSLETTER
function handleNewsletter() {
    const input = document.getElementById('newsletter-email') || document.querySelector('.newsletter-form input[type="email"]');
    const msg = document.getElementById('newsletter-msg') || document.querySelector('.newsletter-msg');

    if (!input || !msg) return;

    if (!input.value || !input.value.includes('@')) {
        msg.style.color = '#e11d48';
        msg.textContent = 'Please enter a valid email.';
        return;
    }

    msg.style.color = '#FCC72F';
    msg.textContent = '✅ You\'re subscribed!';
    input.value = '';
}

// Attach newsletter handlers to every `.newsletter-form` so pages with
// slightly different markup still work without editing HTML.
function attachNewsletterHandlers() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button');

        // find or create a message element local to this form
        let msg = form.parentElement.querySelector('#newsletter-msg') || form.parentElement.querySelector('.newsletter-msg') || form.querySelector('#newsletter-msg') || form.querySelector('.newsletter-msg');
        if (!msg) {
            msg = document.createElement('p');
            msg.className = 'newsletter-msg';
            msg.style.cssText = 'font-size:13px; font-weight:600; margin-top:10px;';
            form.parentElement.appendChild(msg);
        }

        if (!button) return;

        button.addEventListener('click', function (e) {
            e.preventDefault();
            if (!input || !input.value || !input.value.includes('@')) {
                msg.style.color = '#e11d48';
                msg.textContent = 'Please enter a valid email.';
                return;
            }

            msg.style.color = '#FCC72F';
            msg.textContent = '✅ You\'re subscribed!';
            input.value = '';
        });
    });
}

document.addEventListener('DOMContentLoaded', attachNewsletterHandlers);