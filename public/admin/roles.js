// Roles Admin JavaScript

const API_BASE_ROLES = '/api';

const addForm = document.getElementById('addForm');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const rolesTable = document.getElementById('rolesTable');
const messageDiv = document.getElementById('message');

document.addEventListener('DOMContentLoaded', () => {
    loadRoles();
});

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('roleName').value.trim();
    if (!name) { showMessage('Please enter a role name', 'error'); return; }

    try {
        const response = await fetch(`${API_BASE_ROLES}/roles/admin`, {
            method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Role added successfully!', 'success');
            document.getElementById('roleName').value = '';
            loadRoles();
        } else {
            showMessage(data.error || 'Failed to add role', 'error');
        }
    } catch (err) {
        console.error('Error adding role', err);
        showMessage('Failed to add role', 'error');
    }
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editRoleId').value;
    const name = document.getElementById('editRoleName').value.trim();
    const is_active = document.getElementById('editRoleActive').checked;
    try {
        const response = await fetch(`${API_BASE_ROLES}/roles/admin/${id}`, {
            method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, is_active })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Role updated successfully!', 'success');
            closeEditModal();
            loadRoles();
        } else {
            showMessage(data.error || 'Failed to update role', 'error');
        }
    } catch (err) {
        console.error('Error updating role', err);
        showMessage('Failed to update role', 'error');
    }
});

async function loadRoles() {
    try {
        const response = await fetch(`${API_BASE_ROLES}/roles/admin/all`);
        if (!response.ok) throw new Error('Failed to fetch roles');
        const data = await response.json();
        renderRolesTable(data.roles);
    } catch (err) {
        console.error('Error loading roles', err);
        rolesTable.innerHTML = '<div class="error">Failed to load roles. Check console for details.</div>';
    }
}

function renderRolesTable(roles) {
    if (!roles || roles.length === 0) {
        rolesTable.innerHTML = '<div class="empty-state">No roles found. Add your first role above.</div>';
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
                ${roles.map(r => `
                    <tr>
                        <td>${r.id}</td>
                        <td>${escapeHtml(r.name)}</td>
                        <td><span class="status-badge ${r.is_active ? 'status-active' : 'status-inactive'}">${r.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>${formatTimestamp(r.created_at)}</td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-primary btn-sm" onclick="openEditModal(${r.id}, '${escapeHtml(r.name)}', ${r.is_active})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteRole(${r.id}, '${escapeHtml(r.name)}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    rolesTable.innerHTML = table;
}

function openEditModal(id, name, isActive) {
    document.getElementById('editRoleId').value = id;
    document.getElementById('editRoleName').value = name;
    document.getElementById('editRoleActive').checked = isActive;
    editModal.classList.add('active');
}

function closeEditModal() { editModal.classList.remove('active'); editForm.reset(); }

async function deleteRole(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
        const response = await fetch(`${API_BASE_ROLES}/roles/admin/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok) { showMessage('Role deleted successfully!', 'success'); loadRoles(); }
        else { showMessage(data.error || 'Failed to delete role', 'error'); }
    } catch (err) { console.error('Error deleting role', err); showMessage('Failed to delete role', 'error'); }
}

function showMessage(message, type) {
    messageDiv.innerHTML = `<div class="${type}">${escapeHtml(message)}</div>`;
    setTimeout(() => { messageDiv.innerHTML = ''; }, 5000);
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

function formatTimestamp(timestamp) { if (!timestamp) return 'N/A'; const date = new Date(timestamp * 1000); return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); }

// close modal clicking outside
editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
