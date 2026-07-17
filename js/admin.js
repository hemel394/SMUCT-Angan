// ===== CONFIG =====
const API = {
    events:      'api/events.php',
    volunteers:  'api/volunteers.php',
    assignments: 'api/assignments.php'
};

// ===== STATE =====
var eventsCache = [];
var currentStatusFilter = 'upcoming';

function showTableLoading(tbodyId, colspan) {
    var tbody = document.getElementById(tbodyId);
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="empty-row">Loading…</td></tr>';
    }
}

function showGridLoading(gridId, message) {
    var grid = document.getElementById(gridId);
    if (grid) {
        grid.innerHTML = '<p class="empty-row" style="padding:24px 0; grid-column:1/-1;">' + (message || 'Loading…') + '</p>';
    }
}


// ===== TAB SWITCHING =====
function switchTab(tab, btn) {
    document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('tab-' + tab).classList.add('active');
    btn.classList.add('active');
    if (tab === 'assignments') populateAssignDropdowns();
    if (tab === 'status') renderStatusGrid(currentStatusFilter);
}


// ===== DATE/TIME PICKER =====
function openPicker(id) {
    var el = document.getElementById(id);
    if (!el) return;
    try {
        if (el.showPicker) {
            el.showPicker();
        } else {
            el.focus();
        }
    } catch (e) {
        el.focus();
    }
}


// ===== IMAGE PREVIEW =====
function previewImage(input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('preview-name').textContent = file.name;
        document.getElementById('file-preview').style.display = 'flex';
        document.getElementById('file-upload-area').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    document.getElementById('event-image').value = '';
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('file-upload-area').style.display = 'flex';
}

function previewGalleryImages(input) {
    var grid = document.getElementById('gallery-preview-grid');
    grid.innerHTML = '';
    Array.from(input.files).forEach(function(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var div = document.createElement('div');
            div.className = 'gallery-preview-item';
            div.innerHTML = '<img src="' + e.target.result + '"><span>' + file.name + '</span>';
            grid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}


// ===== EVENTS =====
function addEvent() {
    var msg   = document.getElementById('event-msg');
    var title = document.getElementById('event-title').value.trim();
    var date  = document.getElementById('event-date').value;
    var time  = document.getElementById('event-time').value;
    var cat   = document.getElementById('event-category').value;
    var venue = document.getElementById('event-venue').value.trim();
    var desc  = document.getElementById('event-description').value.trim();
    var imageFile = document.getElementById('event-image').files[0];

    if (!title || !date || !cat || !venue) {
        msg.style.color = '#dc2626';
        msg.textContent = '⚠ Please fill in Title, Date, Category and Venue.';
        return;
    }

    // Upload image to imgbb first, then save event
    if (imageFile) {
        uploadToImgbb(imageFile, function(imageUrl) {
            saveEvent(title, date, time, cat, venue, desc, imageUrl, msg);
        }, function() {
            msg.style.color = '#dc2626';
            msg.textContent = '⚠ Image upload failed. Try again.';
        });
    } else {
        saveEvent(title, date, time, cat, venue, desc, '', msg);
    }
}

function uploadToImgbb(file, onSuccess, onError) {
    var formData = new FormData();
    formData.append('image', file);

    fetch('php/imgbb_upload.php', {
        method: 'POST',
        body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            onSuccess(data.url);
        } else {
            onError();
        }
    })
    .catch(onError);
}

function saveEvent(title, date, time, cat, venue, desc, imageUrl, msg) {
    var formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('category', cat);
    formData.append('venue', venue);
    formData.append('description', desc);
    formData.append('image_url', imageUrl);

    fetch('php/events/create.php', {
        method: 'POST',
        body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            msg.style.color = '#16a34a';
            msg.textContent = '✓ Event created successfully!';
            // Reset form
            document.getElementById('event-title').value = '';
            document.getElementById('event-date').value = '';
            document.getElementById('event-time').value = '';
            document.getElementById('event-category').value = '';
            document.getElementById('event-venue').value = '';
            document.getElementById('event-description').value = '';
            removeImage();
            loadEvents();
        } else {
            msg.style.color = '#dc2626';
            msg.textContent = '⚠ ' + data.message;
        }
    })
    .catch(function() {
        msg.style.color = '#dc2626';
        msg.textContent = '⚠ Something went wrong.';
    });

    setTimeout(function() { msg.textContent = ''; }, 3000);
}

function loadEvents() {
    showTableLoading('events-table-body', 7);
    showGridLoading('status-grid');
    fetch('php/events/read.php')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            eventsCache = data || [];
            renderEvents(eventsCache.map(function(e) {
                return {
                    id:       e.id,
                    title:    e.title,
                    date:     e.event_date,
                    time:     e.event_time,
                    category: e.category,
                    venue:    e.venue,
                    status:   e.status
                };
            }));
            renderStatusGrid(currentStatusFilter);
        })
        .catch(function() {
            eventsCache = [];
            renderEvents([]);
            renderStatusGrid(currentStatusFilter);
        });
}

function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    fetch('php/events/delete.php?id=' + id)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { loadEvents(); }
            else { alert('Delete failed: ' + data.message); }
        });
}

function openEditModal(id) {
    fetch('php/events/get.php?id=' + id)
        .then(function(res) { return res.json(); })
        .then(function(e) {
            document.getElementById('edit-event-id').value        = e.id;
            document.getElementById('edit-event-title').value     = e.title;
            document.getElementById('edit-event-date').value      = e.event_date;
            document.getElementById('edit-event-time').value      = e.event_time;
            document.getElementById('edit-event-category').value  = e.category;
            document.getElementById('edit-event-venue').value     = e.venue;
            document.getElementById('edit-event-status').value    = e.status;
            document.getElementById('edit-event-description').value = e.description;
            document.getElementById('edit-modal').style.display   = 'flex';
        });
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function saveEditEvent() {
    var formData = new FormData();
    formData.append('id',          document.getElementById('edit-event-id').value);
    formData.append('title',       document.getElementById('edit-event-title').value);
    formData.append('date',        document.getElementById('edit-event-date').value);
    formData.append('time',        document.getElementById('edit-event-time').value);
    formData.append('category',    document.getElementById('edit-event-category').value);
    formData.append('venue',       document.getElementById('edit-event-venue').value);
    formData.append('status',      document.getElementById('edit-event-status').value);
    formData.append('description', document.getElementById('edit-event-description').value);

    fetch('php/events/update.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { closeEditModal(); loadEvents(); }
            else { alert('Update failed: ' + data.message); }
        });
}

function renderEvents(data) {
    var tbody = document.getElementById('events-table-body');
    var count = document.getElementById('event-count');

    if (!data || data.length === 0) {
        count.textContent = '0 Events';
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No events yet. Add your first event above.</td></tr>';
        return;
    }

    count.textContent = data.length + ' Event' + (data.length !== 1 ? 's' : '');
    tbody.innerHTML = data.map(function(ev, i) {
        var isArchived = ev.status === 'archived';
        var safeTitle  = ev.title.replace(/'/g, "\\'");

        var actions = '<button class="action-btn edit-btn" onclick="openEditModal(' + ev.id + ')">Edit</button>';
        if (isArchived) {
            actions += '<button class="action-btn upload-btn" onclick="openUploadModal(' + ev.id + ', \'' + safeTitle + '\')">📷 Photos</button>';
        } else {
            actions += '<button class="archive-btn" onclick="openArchiveModal(' + ev.id + ', \'' + safeTitle + '\')">Archive</button>';
        }
        actions += '<button class="action-btn delete-btn" onclick="deleteEvent(' + ev.id + ')">Delete</button>';

        return '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td><strong>' + ev.title + '</strong></td>' +
            '<td><div class="date-time-cell"><span class="cell-date">📅 ' + ev.date + '</span><span class="cell-time">⏰ ' + (ev.time || '—') + '</span></div></td>' +
            '<td><span class="tag tag-' + ev.category + '">' + ev.category + '</span></td>' +
            '<td class="venue-cell">' + ev.venue + '</td>' +
            '<td><span class="status-badge ' + ev.status + '">' + (ev.status === 'upcoming' ? 'Upcoming' : 'Archived') + '</span></td>' +
            '<td>' + actions + '</td>' +
        '</tr>';
    }).join('');
}


// ===== EVENT STATUS TAB =====
function switchEventSubTab(status, btn) {
    currentStatusFilter = status;
    document.querySelectorAll('.event-subtab-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderStatusGrid(status);
}

function renderStatusGrid(status) {
    var grid = document.getElementById('status-grid');
    if (!grid) return;

    var upcoming = eventsCache.filter(function(e) { return e.status === 'upcoming'; });
    var archived = eventsCache.filter(function(e) { return e.status === 'archived'; });

    var countUp   = document.getElementById('count-upcoming');
    var countArch = document.getElementById('count-archived');
    if (countUp)   countUp.textContent   = upcoming.length;
    if (countArch) countArch.textContent = archived.length;

    var list = status === 'archived' ? archived : upcoming;

    if (list.length === 0) {
        grid.innerHTML = '<p class="empty-row" style="grid-column:1/-1;">No ' + status + ' events yet.</p>';
        return;
    }

    grid.innerHTML = list.map(function(ev) {
        var safeTitle = ev.title.replace(/'/g, "\\'");
        var img = ev.image_url
            ? '<img src="' + ev.image_url + '" alt="' + ev.title + '">'
            : '<div class="status-card-noimg">🖼️</div>';

        var actionBtn = status === 'archived'
            ? '<button class="action-btn upload-btn" onclick="openUploadModal(' + ev.id + ', \'' + safeTitle + '\')">📷 Upload to Gallery</button>'
            : '<button class="archive-btn" onclick="openArchiveModal(' + ev.id + ', \'' + safeTitle + '\')">Archive Event</button>';

        return '<div class="status-card">' +
            '<div class="status-card-img-wrap">' + img +
                '<span class="tag tag-' + ev.category + ' status-card-tag">' + ev.category + '</span>' +
            '</div>' +
            '<div class="status-card-body">' +
                '<h4>' + ev.title + '</h4>' +
                '<p class="status-card-meta">📅 ' + ev.event_date + (ev.event_time ? ' &middot; ⏰ ' + ev.event_time : '') + '</p>' +
                '<p class="status-card-meta">📍 ' + ev.venue + '</p>' +
                actionBtn +
            '</div>' +
        '</div>';
    }).join('');
}


// ===== ARCHIVE =====
var currentArchiveId = null;

function openArchiveModal(id, title) {
    currentArchiveId = id;
    document.getElementById('archive-event-name').textContent = title;
    document.getElementById('archive-modal').style.display = 'flex';
}

function closeArchiveModal() {
    document.getElementById('archive-modal').style.display = 'none';
    currentArchiveId = null;
}

function confirmArchive() {
    if (!currentArchiveId) return;
    fetch('php/events/archive.php?id=' + currentArchiveId, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { closeArchiveModal(); loadEvents(); }
            else { alert('Archive failed: ' + data.message); }
        })
        .catch(function() { alert('Something went wrong.'); });
}


// ===== GALLERY UPLOAD =====
var currentUploadEventId = null;

function openUploadModal(id, title) {
    currentUploadEventId = id;
    document.getElementById('upload-event-name').textContent = title ? '📌 ' + title : '';
    document.getElementById('gallery-upload').value = '';
    document.getElementById('upload-msg').textContent = '';
    document.getElementById('upload-modal').style.display = 'flex';
    loadEventGalleryPhotos(id);
}

function loadEventGalleryPhotos(eventId) {
    var grid = document.getElementById('gallery-preview-grid');
    grid.innerHTML = '<p style="grid-column:1/-1;">Loading photos...</p>';

    fetch('php/gallery/read.php')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var photos = data.filter(function(p) { return p.event_id == eventId; });

            if (photos.length === 0) {
                grid.innerHTML = '<p style="grid-column:1/-1;">No photos uploaded yet for this event.</p>';
                return;
            }

            grid.innerHTML = photos.map(function(p) {
                return '<div class="gallery-preview-item">' +
                    '<img src="' + p.image_url + '">' +
                    '<button class="file-remove-btn" onclick="deleteGalleryPhoto(' + p.id + ', ' + eventId + ')">✕ Remove</button>' +
                '</div>';
            }).join('');
        });
}

function deleteGalleryPhoto(photoId, eventId) {
    if (!confirm('Remove this photo from the gallery?')) return;
    fetch('php/gallery/delete.php?id=' + photoId, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                loadEventGalleryPhotos(eventId);
            } else {
                alert('Delete failed: ' + data.message);
            }
        });
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
    currentUploadEventId = null;
}

function saveGalleryPhotos() {
    var input = document.getElementById('gallery-upload');
    var msg   = document.getElementById('upload-msg');

    if (!input.files || input.files.length === 0) {
        msg.style.color = '#dc2626';
        msg.textContent = '⚠ Select at least one photo.';
        return;
    }

    msg.style.color = '#1130A2';
    msg.textContent = 'Uploading ' + input.files.length + ' photo(s)...';

    var files   = Array.from(input.files);
    var uploads = files.map(function(file) {
        var formData = new FormData();
        formData.append('image', file);
        return fetch('php/imgbb_upload.php', {
            method: 'POST',
            body: formData
        })
        .then(function(res) { return res.json(); })
        .then(function(data) { return data.success ? data.url : null; })
        .catch(function(err) { console.error('imgbb upload error:', err); return null; });
    });

    Promise.all(uploads).then(function(urls) {
        var validUrls = urls.filter(function(u) { return u !== null; });
        if (validUrls.length === 0) {
            msg.style.color = '#dc2626';
            msg.textContent = '⚠ All uploads failed. Check your imgbb API key.';
            return;
        }

        var formData = new FormData();
        formData.append('event_id', currentUploadEventId);
        formData.append('urls', JSON.stringify(validUrls));

        fetch('php/gallery/upload.php', { method: 'POST', body: formData })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) {
                    msg.style.color = '#16a34a';
                    msg.textContent = '✓ ' + validUrls.length + ' photo(s) uploaded to gallery!';
                    setTimeout(closeUploadModal, 1500);
                } else {
                    msg.style.color = '#dc2626';
                    msg.textContent = '⚠ ' + data.message;
                }
            })
            .catch(function(err) {
                msg.style.color = '#dc2626';
                msg.textContent = '⚠ Failed to save to gallery.';
                console.error(err);
            });
    }).catch(function(err) {
        msg.style.color = '#dc2626';
        msg.textContent = '⚠ Something went wrong uploading photos.';
        console.error(err);
    });
}


// ===== VOLUNTEERS =====
function addVolunteer() {
    var msg   = document.getElementById('vol-msg');
    var name  = document.getElementById('vol-name').value.trim();
    var id    = document.getElementById('vol-id').value.trim();
    var dept  = document.getElementById('vol-dept').value;
    var email = document.getElementById('vol-email').value.trim();

    if (!name || !id || !dept || !email) {
        msg.style.color = '#dc2626';
        msg.textContent = '⚠ Please fill in all fields.';
        return;
    }

    var formData = new FormData();
    formData.append('name', name);
    formData.append('student_id', id);
    formData.append('department', dept);
    formData.append('email', email);
    formData.append('source', 'admin');

    fetch('php/volunteers/create.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                msg.style.color = '#16a34a';
                msg.textContent = '✓ Volunteer added successfully!';
                document.getElementById('vol-name').value  = '';
                document.getElementById('vol-id').value    = '';
                document.getElementById('vol-dept').value  = '';
                document.getElementById('vol-email').value = '';
                loadVolunteers();
            } else {
                msg.style.color = '#dc2626';
                msg.textContent = '⚠ ' + data.message;
            }
        });

    setTimeout(function() { msg.textContent = ''; }, 3000);
}

function loadVolunteers() {
    showTableLoading('pending-table-body', 8);
    showTableLoading('volunteers-table-body', 6);
    fetch('php/volunteers/read.php')
        .then(function(res) { return res.json(); })
        .then(renderVolunteers)
        .catch(function() { renderVolunteers([]); });
}

function deleteVolunteer(id) {
    if (!confirm('Remove this volunteer?')) return;
    fetch('php/volunteers/delete.php?id=' + id, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { loadVolunteers(); }
            else { alert('Delete failed: ' + data.message); }
        });
}

function renderVolunteers(data) {
    var pending  = data.filter(function(v) { return v.status === 'pending'; });
    var approved = data.filter(function(v) { return v.status === 'approved'; });

    renderPendingTable(pending);
    renderApprovedTable(approved);
}

function renderPendingTable(data) {
    var tbody = document.getElementById('pending-table-body');
    var count = document.getElementById('pending-count');

    if (!data || data.length === 0) {
        count.textContent = '0 Pending';
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No pending requests.</td></tr>';
        return;
    }

    count.textContent = data.length + ' Pending';
    tbody.innerHTML = data.map(function(v, i) {
        return '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td><strong>' + v.name + '</strong></td>' +
            '<td>' + v.student_id + '</td>' +
            '<td>' + v.department + '</td>' +
            '<td>' + v.email + '</td>' +
            '<td>' + (v.phone || '—') + '</td>' +
            '<td>' + (v.preferred_event || '—') + '</td>' +
            '<td>' +
                '<button class="action-btn edit-btn" onclick="approveVolunteer(' + v.id + ')">Accept</button>' +
                '<button class="action-btn delete-btn" onclick="rejectVolunteer(' + v.id + ')">Reject</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function renderApprovedTable(data) {
    var tbody = document.getElementById('volunteers-table-body');
    var count = document.getElementById('vol-count');

    if (!data || data.length === 0) {
        count.textContent = '0 Volunteers';
        tbody.innerHTML = '<tr><td colspan="6" class="empty-row">No verified volunteers yet.</td></tr>';
        return;
    }

    count.textContent = data.length + ' Volunteer' + (data.length !== 1 ? 's' : '');
    tbody.innerHTML = data.map(function(v, i) {
        return '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td><strong>' + v.name + '</strong></td>' +
            '<td>' + v.student_id + '</td>' +
            '<td>' + v.department + '</td>' +
            '<td>' + v.email + '</td>' +
            '<td><button class="action-btn delete-btn" onclick="deleteVolunteer(' + v.id + ')">Remove</button></td>' +
        '</tr>';
    }).join('');
}

function approveVolunteer(id) {
    fetch('php/volunteers/approve.php?id=' + id, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { loadVolunteers(); }
            else { alert('Approve failed: ' + data.message); }
        });
}

function rejectVolunteer(id) {
    if (!confirm('Reject and remove this volunteer request?')) return;
    fetch('php/volunteers/reject.php?id=' + id, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { loadVolunteers(); }
            else { alert('Reject failed: ' + data.message); }
        });
}


// ===== ASSIGNMENTS =====



function populateAssignDropdowns() {
    var eventSel = document.getElementById('assign-event');
    var volSel   = document.getElementById('assign-volunteer');
    if (eventSel) eventSel.innerHTML = '<option value="">Loading events…</option>';
    if (volSel)   volSel.innerHTML   = '<option value="">Loading volunteers…</option>';

    fetch('php/events/read.php')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var sel = document.getElementById('assign-event');
            sel.innerHTML = '<option value="">Select an event</option>';
            data.filter(function(e) { return e.status === 'upcoming'; })
                .forEach(function(e) {
                    sel.innerHTML += '<option value="' + e.id + '">' + e.title + '</option>';
                });
        })
        .catch(function() {
            eventSel.innerHTML = '<option value="">Couldn\'t load events</option>';
        });

    fetch('php/volunteers/read.php')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var sel = document.getElementById('assign-volunteer');
            sel.innerHTML = '<option value="">Select a volunteer</option>';
            data.forEach(function(v) {
                sel.innerHTML += '<option value="' + v.id + '">' + v.name + '</option>';
            });
        })
        .catch(function() {
            volSel.innerHTML = '<option value="">Couldn\'t load volunteers</option>';
        });
}

function addAssignment() {
    var eventId     = document.getElementById('assign-event').value;
    var volunteerId = document.getElementById('assign-volunteer').value;
    var msg         = document.getElementById('assign-msg');

    if (!eventId || !volunteerId) {
        msg.style.color = '#dc2626';
        msg.textContent = '⚠ Please select both an event and a volunteer.';
        return;
    }

    var formData = new FormData();
    formData.append('event_id',     eventId);
    formData.append('volunteer_id', volunteerId);

    fetch('php/assignments/create.php', { method: 'POST', body: formData })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                msg.style.color = '#16a34a';
                msg.textContent = '✓ Assignment confirmed!';
                loadAssignments();
            } else {
                msg.style.color = '#dc2626';
                msg.textContent = '⚠ ' + data.message;
            }
        });

    setTimeout(function() { msg.textContent = ''; }, 3000);
}

function loadAssignments() {
    showGridLoading('task-force-grid');
    fetch('php/assignments/read.php')
        .then(function(res) { return res.json(); })
        .then(renderAssignments)
        .catch(function() { renderAssignments([]); });
}

function deleteAssignment(id) {
    if (!confirm('Remove this assignment?')) return;
    fetch('php/assignments/delete.php?id=' + id, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) { loadAssignments(); }
            else { alert('Delete failed: ' + data.message); }
        });
}

function renderAssignments(data) {
    var grid  = document.getElementById('task-force-grid');
    var count = document.getElementById('assign-count');

    if (!data || data.length === 0) {
        count.textContent = '0 Assignments';
        grid.innerHTML = '<p class="empty-row" style="padding:24px 0; grid-column:1/-1;">No assignments yet.</p>';
        return;
    }

    count.textContent = data.length + ' Assignment' + (data.length !== 1 ? 's' : '');
    grid.innerHTML = data.map(function(a) {
        return '<div class="task-force-card">' +
            '<div class="tf-avatar">' + a.volunteer_name.charAt(0).toUpperCase() + '</div>' +
            '<div class="tf-info"><h4>' + a.volunteer_name + '</h4><p>' + a.event_title + '</p></div>' +
            '<button class="tf-remove-btn" onclick="deleteAssignment(' + a.id + ')">✕</button>' +
        '</div>';
    }).join('');
}




// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadVolunteers();
    loadAssignments();
});