// Admin Deadline Management
const API_BASE = '/api';

let categories = [];
let editingDeadlineId = null;
let currentAppId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadOfficialDeadlines();
    loadApplications();
});

// Load categories for dropdown
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();

        if (data.ok && data.categories) {
            categories = data.categories;
            populateCategoryDropdown();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Populate category dropdown
function populateCategoryDropdown() {
    const select = document.getElementById('deadlineCategory');
    select.innerHTML = '<option value="">-- No Category --</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.name} (${cat.type})`;
        select.appendChild(option);
    });
}

// Load official deadlines
async function loadOfficialDeadlines() {
    try {
        const response = await fetch(`${API_BASE}/deadlines/admin/official`);
        const data = await response.json();

        if (data.ok) {
            displayOfficialDeadlines(data.deadlines);
        }
    } catch (error) {
        console.error('Error loading official deadlines:', error);
        document.getElementById('officialDeadlines').innerHTML =
            '<div class="empty-state" style="color: red;">Failed to load deadlines</div>';
    }
}

// Display official deadlines
function displayOfficialDeadlines(deadlines) {
    const container = document.getElementById('officialDeadlines');

    if (!deadlines || deadlines.length === 0) {
        container.innerHTML = '<div class="empty-state">No official deadlines yet. Create one to get started!</div>';
        return;
    }

    container.innerHTML = deadlines.map(deadline => {
        const startDate = new Date(deadline.start_date * 1000).toLocaleDateString();
        const endDate = new Date(deadline.end_date * 1000).toLocaleDateString();
        const statusClass = `status-${deadline.status}`;
        const cardClass = deadline.status === 'expired' ? 'deadline-card official expired' : 'deadline-card official';

        return `
            <div class="${cardClass}">
                <div class="deadline-header">
                    <div class="deadline-name">${escapeHtml(deadline.name)}</div>
                    <span class="deadline-status ${statusClass}">${deadline.status.toUpperCase()}</span>
                </div>
                
                ${deadline.description ? `<p style="margin: 0.5rem 0; color: #555;">${escapeHtml(deadline.description)}</p>` : ''}
                
                <div class="deadline-dates">
                    <div>
                        <span class="date-label">Start:</span> ${startDate}
                    </div>
                    <div>
                        <span class="date-label">End:</span> ${endDate}
                    </div>
                </div>
                
                ${deadline.category_name ? `
                    <div class="deadline-category">
                        📁 ${escapeHtml(deadline.category_name)} (${deadline.category_type})
                    </div>
                ` : ''}
                
                <div class="deadline-actions">
                    <button class="button success" onclick="editDeadline(${deadline.id}, '${escapeHtml(deadline.name)}', '${escapeHtml(deadline.description || '')}', ${deadline.start_date}, ${deadline.end_date}, ${deadline.category_id || 'null'})">
                        Edit
                    </button>
                    <button class="button danger" onclick="deleteDeadline(${deadline.id}, '${escapeHtml(deadline.name)}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Open create modal
function openCreateModal() {
    editingDeadlineId = null;
    document.getElementById('modalTitle').textContent = 'Create Official Deadline';
    document.getElementById('deadlineForm').reset();
    document.getElementById('deadlineId').value = '';
    document.getElementById('deadlineModal').classList.add('active');
}

// Edit deadline
function editDeadline(id, name, description, startDate, endDate, categoryId) {
    editingDeadlineId = id;
    document.getElementById('modalTitle').textContent = 'Edit Official Deadline';
    document.getElementById('deadlineId').value = id;
    document.getElementById('deadlineName').value = name;
    document.getElementById('deadlineDescription').value = description;

    // Convert Unix timestamp to date string
    const startDateObj = new Date(startDate * 1000);
    const endDateObj = new Date(endDate * 1000);
    document.getElementById('deadlineStartDate').value = startDateObj.toISOString().split('T')[0];
    document.getElementById('deadlineEndDate').value = endDateObj.toISOString().split('T')[0];

    document.getElementById('deadlineCategory').value = categoryId || '';
    document.getElementById('deadlineModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('deadlineModal').classList.remove('active');
    document.getElementById('deadlineForm').reset();
    editingDeadlineId = null;
}

// Save deadline (create or update)
async function saveDeadline(event) {
    event.preventDefault();

    const name = document.getElementById('deadlineName').value.trim();
    const description = document.getElementById('deadlineDescription').value.trim();
    const startDateStr = document.getElementById('deadlineStartDate').value;
    const endDateStr = document.getElementById('deadlineEndDate').value;
    const categoryId = document.getElementById('deadlineCategory').value;

    if (!name || !startDateStr || !endDateStr) {
        alert('Please fill in all required fields');
        return;
    }

    // Convert to Unix timestamps
    const startDate = Math.floor(new Date(startDateStr).getTime() / 1000);
    const endDate = Math.floor(new Date(endDateStr + 'T23:59:59').getTime() / 1000);

    if (startDate >= endDate) {
        alert('End date must be after start date');
        return;
    }

    const payload = {
        name,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId ? parseInt(categoryId) : null
    };

    try {
        let response;
        if (editingDeadlineId) {
            // Update
            response = await fetch(`${API_BASE}/deadlines/admin/official/${editingDeadlineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Create
            response = await fetch(`${API_BASE}/deadlines/admin/official`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const data = await response.json();

        if (data.ok) {
            alert(editingDeadlineId ? '✅ Deadline updated successfully!' : '✅ Deadline created successfully!');
            closeModal();
            loadOfficialDeadlines();
        } else {
            alert('❌ Error: ' + (data.error || 'Failed to save deadline'));
        }
    } catch (error) {
        console.error('Error saving deadline:', error);
        alert('❌ Error: Failed to save deadline');
    }
}

// Delete deadline
async function deleteDeadline(id, name) {
    if (!confirm(`Are you sure you want to delete the deadline "${name}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/deadlines/admin/official/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.ok) {
            alert('✅ Deadline deleted successfully!');
            loadOfficialDeadlines();
        } else {
            alert('❌ Error: ' + (data.error || 'Failed to delete deadline'));
        }
    } catch (error) {
        console.error('Error deleting deadline:', error);
        alert('❌ Error: Failed to delete deadline');
    }
}

// ============================================
// APPLICATION MANAGEMENT
// ============================================

// Load applications
async function loadApplications() {
    try {
        const response = await fetch(`${API_BASE}/deadlines/admin/applications`);
        const data = await response.json();

        if (data.ok) {
            displayApplications(data.applications);
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('grantApplications').innerHTML =
            '<div class="empty-state" style="color: red;">Failed to load applications</div>';
    }
}

// Display applications
function displayApplications(apps) {
    const container = document.getElementById('grantApplications');

    if (!apps || apps.length === 0) {
        container.innerHTML = '<div class="empty-state">No applications received yet.</div>';
        return;
    }

    container.innerHTML = apps.map(app => {
        const appliedDate = new Date(app.applied_at).toLocaleDateString();
        const statusColor = getStatusColor(app.status);

        return `
            <div class="deadline-card" style="border-left-color: ${statusColor};">
                <div class="deadline-header">
                    <div class="deadline-name">${escapeHtml(app.event_name)}</div>
                    <span class="deadline-status" style="background-color: ${statusColor}; color: white;">
                        ${formatStatus(app.status)}
                    </span>
                </div>
                
                <div style="margin: 0.5rem 0; font-size: 0.9rem;">
                    <strong>Applicant:</strong> ${escapeHtml(app.user_name)} (${escapeHtml(app.user_email)})
                </div>
                
                <div style="margin: 0.5rem 0; font-size: 0.9rem; color: #7f8c8d;">
                    Applied on: ${appliedDate}
                </div>
                
                <div class="deadline-actions">
                    <button class="button" onclick='openAppModal(${JSON.stringify(app).replace(/'/g, "&#39;")})'>
                        Manage Application
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusColor(status) {
    switch (status) {
        case 'draft': return '#95a5a6';
        case 'pending_review': return '#f39c12';
        case 'approved': return '#27ae60';
        case 'payment_processing': return '#3498db';
        case 'completed': return '#8e44ad';
        case 'rejected': return '#e74c3c';
        default: return '#95a5a6';
    }
}

function formatStatus(status) {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Open Application Modal
function openAppModal(app) {
    currentAppId = app.id;
    const detailsContainer = document.getElementById('appDetails');

    detailsContainer.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>Event:</strong> ${escapeHtml(app.event_name)}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Applicant:</strong> ${escapeHtml(app.user_name)}<br>
            <span style="color: #7f8c8d; font-size: 0.9rem;">${escapeHtml(app.user_email)}</span>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Applied Date:</strong> ${new Date(app.applied_at).toLocaleString()}
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
            <strong>Statement of Purpose / Notes:</strong><br>
            <p style="margin-top: 0.5rem; white-space: pre-wrap;">${escapeHtml(app.notes || 'No notes provided.')}</p>
        </div>
    `;

    // Populate current stage and status inputs
    document.getElementById('appStage').value = app.current_stage_id || 1;
    document.getElementById('appApprovedAmount').value = app.approved_amount || 0;
    document.getElementById('appStatus').value = app.status;
    document.getElementById('applicationModal').classList.add('active');
}

function closeAppModal() {
    document.getElementById('applicationModal').classList.remove('active');
    currentAppId = null;
}

// Update Application Status
async function updateAppStatus() {
    if (!currentAppId) return;

    const newStatus = document.getElementById('appStatus').value;
    const newStage = parseInt(document.getElementById('appStage').value);

    try {
        const response = await fetch(`${API_BASE}/deadlines/admin/applications/${currentAppId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: newStatus,
                current_stage_id: newStage,
                approved_amount: parseFloat(document.getElementById('appApprovedAmount').value) || 0
            })
        });

        const data = await response.json();

        if (data.ok) {
            alert('✅ Status and stage updated successfully!');
            loadApplications(); // Refresh list
            // Don't close modal so admin can see change, or close it? User flow suggests admin changes state.
            // I'll keep it open for now.
        } else {
            alert('❌ Error: ' + (data.error || 'Failed to update status'));
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('❌ Error: Failed to update status');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
document.getElementById('deadlineModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('deadlineModal')) {
        closeModal();
    }
});

document.getElementById('applicationModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('applicationModal')) {
        closeAppModal();
    }
});
