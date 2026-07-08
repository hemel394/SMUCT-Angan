// LOGIN

function handleLogin() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    fetch('php/login.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                window.location.href = 'admin.html';
            } else {
                document.getElementById('login-error').textContent = data.message;
            }
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
            }
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
            }
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

// ADMIN TABS
function switchTab(tab, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    btn.classList.add('active');
}

// ADMIN - ADD EVENT
function addEvent() {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const category = document.getElementById('event-category').value;
    const venue = document.getElementById('event-venue').value;

    if (!title || !date || !category || !venue) {
        document.getElementById('event-msg').style.color = '#e11d48';
        document.getElementById('event-msg').textContent = 'Please fill in all required fields.';
        return;
    }

    const tbody = document.getElementById('events-table-body');
    const count = tbody.rows.length + 1;
    const row = `<tr>
        <td>${count}</td>
        <td>${title}</td>
        <td>${date}</td>
        <td><span class="tag tag-${category}">${category}</span></td>
        <td><span class="status-badge upcoming">Upcoming</span></td>
        <td>
            <button class="action-btn edit-btn">Edit</button>
            <button class="action-btn delete-btn">Delete</button>
        </td>
    </tr>`;
    tbody.innerHTML += row;
    document.getElementById('event-count').textContent = count + ' Events';
    document.getElementById('event-msg').style.color = '#059669';
    document.getElementById('event-msg').textContent = '✅ Event created successfully!';
}

// ADMIN - ADD VOLUNTEER
function addVolunteer() {
    const name = document.getElementById('vol-name').value;
    const id = document.getElementById('vol-id').value;
    const dept = document.getElementById('vol-dept').value;
    const email = document.getElementById('vol-email').value;

    if (!name || !id || !dept || !email) {
        document.getElementById('vol-msg').style.color = '#e11d48';
        document.getElementById('vol-msg').textContent = 'Please fill in all required fields.';
        return;
    }

    const tbody = document.getElementById('volunteers-table-body');
    const count = tbody.rows.length + 1;
    const row = `<tr>
        <td>${count}</td>
        <td>${name}</td>
        <td>${id}</td>
        <td>${dept}</td>
        <td><span class="activity-badge">0 Events</span></td>
        <td><button class="action-btn delete-btn">Remove</button></td>
    </tr>`;
    tbody.innerHTML += row;
    document.getElementById('vol-count').textContent = count + ' Volunteers';
    document.getElementById('vol-msg').style.color = '#059669';
    document.getElementById('vol-msg').textContent = '✅ Volunteer added successfully!';
}

// ADMIN - ADD ASSIGNMENT
function addAssignment() {
    const event = document.getElementById('assign-event').value;
    const volunteer = document.getElementById('assign-volunteer').value;

    if (!event || !volunteer) {
        document.getElementById('assign-msg').style.color = '#e11d48';
        document.getElementById('assign-msg').textContent = 'Please select both an event and a volunteer.';
        return;
    }

    const grid = document.getElementById('task-force-grid');
    const initial = volunteer.charAt(0).toUpperCase();
    const card = `<div class="task-force-card">
        <div class="tf-avatar">${initial}</div>
        <div class="tf-info">
            <h4>${volunteer}</h4>
            <p>${event}</p>
        </div>
    </div>`;
    grid.innerHTML += card;

    const count = grid.querySelectorAll('.task-force-card').length;
    document.getElementById('assign-count').textContent = count + ' Assignments';
    document.getElementById('assign-msg').style.color = '#059669';
    document.getElementById('assign-msg').textContent = '✅ Assignment confirmed!';
}

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