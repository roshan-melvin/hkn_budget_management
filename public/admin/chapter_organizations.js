// Chapter Organizations Admin JavaScript

const API_BASE = '/api';

// DOM Elements
const addForm = document.getElementById('addForm');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const organizationsTable = document.getElementById('organizationsTable');
const messageDiv = document.getElementById('message');

// Load organizations on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOrganizations();
});

// Add organization form handler
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('orgName').value.trim();

    if (!name) {
        showMessage('Please enter an organization name', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/chapter-organizations/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Organization added successfully!', 'success');
            document.getElementById('orgName').value = '';
            loadOrganizations();
        } else {
            showMessage(data.error || 'Failed to add organization', 'error');
        }
    } catch (error) {
        console.error('Error adding organization:', error);
        showMessage('Failed to add organization', 'error');
    }
});

// Edit organization form handler
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editOrgId').value;
    const name = document.getElementById('editOrgName').value.trim();
    const is_active = document.getElementById('editOrgActive').checked;

    try {
        const response = await fetch(`${API_BASE}/chapter-organizations/admin/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, is_active })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Organization updated successfully!', 'success');
            closeEditModal();
            loadOrganizations();
        } else {
            showMessage(data.error || 'Failed to update organization', 'error');
        }
    } catch (error) {
        console.error('Error updating organization:', error);
        showMessage('Failed to update organization', 'error');
    }
});

// Load all organizations
async function loadOrganizations() {
    try {
        const response = await fetch(`${API_BASE}/chapter-organizations/admin/all`);

        if (!response.ok) {
            throw new Error('Failed to fetch organizations');
        }

        const data = await response.json();
        renderOrganizationsTable(data.organizations);
    } catch (error) {
        console.error('Error loading organizations:', error);
        organizationsTable.innerHTML = '<div class="error">Failed to load organizations. Check console for details.</div>';
    }
}

// Render organizations table
function renderOrganizationsTable(organizations) {
    if (!organizations || organizations.length === 0) {
        organizationsTable.innerHTML = '<div class="empty-state">No organizations found. Add your first organization above.</div>';
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${organizations.map(org => `
                    <tr>
                        <td>${org.id}</td>
                        <td>${escapeHtml(org.name)}</td>
                        <td>
                            <span class="status-badge ${org.is_active ? 'status-active' : 'status-inactive'}">
                                ${org.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>${formatTimestamp(org.created_at)}</td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-primary btn-sm" onclick="openEditModal(${org.id}, '${escapeHtml(org.name)}', ${org.is_active})">
                                    Edit
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteOrganization(${org.id}, '${escapeHtml(org.name)}')">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    organizationsTable.innerHTML = table;
}

// Open edit modal
function openEditModal(id, name, isActive) {
    document.getElementById('editOrgId').value = id;
    document.getElementById('editOrgName').value = name;
    document.getElementById('editOrgActive').checked = isActive;
    editModal.classList.add('active');
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    editForm.reset();
}

// Delete organization
async function deleteOrganization(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone. If users are associated with this organization, deletion will fail.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/chapter-organizations/admin/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Organization deleted successfully!', 'success');
            loadOrganizations();
        } else {
            showMessage(data.error || 'Failed to delete organization', 'error');
        }
    } catch (error) {
        console.error('Error deleting organization:', error);
        showMessage('Failed to delete organization', 'error');
    }
}

// Show message
function showMessage(message, type) {
    messageDiv.innerHTML = `<div class="${type}">${escapeHtml(message)}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});
