// Admin - Category Management
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('createBtn').addEventListener('click', createCategory);
    document.getElementById('refreshBtn').addEventListener('click', loadCategories);
    document.getElementById('saveUpdateBtn').addEventListener('click', saveUpdate);
    document.getElementById('cancelUpdateBtn').addEventListener('click', closeUpdateModal);
}

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);

        if (!response.ok) {
            throw new Error('Failed to load categories');
        }

        const data = await response.json();
        displayCategories(data.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('catTableBody').innerHTML = `
            <tr><td colspan="5" style="text-align:center;color:red">Error: ${error.message}</td></tr>
        `;
    }
}

function displayCategories(categories) {
    const tbody = document.getElementById('catTableBody');

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No categories found</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(cat => {
        const isDefault = cat.user_id === null;
        const scopeBadge = isDefault
            ? '<span class="badge badge-default">Admin</span>'
            : '<span class="badge badge-user">User</span>';

        const typeBadge = cat.type === 'income'
            ? '<span class="badge badge-income">Income</span>'
            : '<span class="badge badge-expense">Expense</span>';

        const actions = `
                <button onclick="editCategory(${cat.id}, '${cat.name}', '${cat.type}', ${isDefault})">Edit</button>
                <button class="danger" onclick="deleteCategory(${cat.id}, '${cat.name}')">Delete</button>
              `;

        return `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.name}</td>
                <td>${typeBadge}</td>
                <td>${scopeBadge}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

// Create new category
async function createCategory() {
    const name = document.getElementById('catName').value.trim();
    const type = document.getElementById('catType').value;
    const output = document.getElementById('createOutput');

    if (!name) {
        output.style.display = 'block';
        output.textContent = 'Error: Category name is required';
        output.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create category');
        }

        output.style.display = 'block';
        output.style.color = 'green';
        output.textContent = `✅ Category "${name}" created successfully!\n${JSON.stringify(data, null, 2)}`;

        // Clear form
        document.getElementById('catName').value = '';
        document.getElementById('catType').value = 'income';

        // Reload list
        setTimeout(() => {
            loadCategories();
            output.style.display = 'none';
        }, 2000);

    } catch (error) {
        output.style.display = 'block';
        output.style.color = 'red';
        output.textContent = `❌ Error: ${error.message}`;
    }
}

// Edit category
function editCategory(id, name, type, isDefault) {
    document.getElementById('updateId').value = id;
    document.getElementById('updateName').value = name;
    document.getElementById('updateType').value = type;

    // Show "Make Global" checkbox only if it's NOT default (i.e., user-specific)
    const globalContainer = document.getElementById('makeGlobalContainer');
    const globalCheckbox = document.getElementById('makeGlobal');

    if (!isDefault) {
        globalContainer.style.display = 'block';
        globalCheckbox.checked = false;
    } else {
        globalContainer.style.display = 'none';
        globalCheckbox.checked = false;
    }

    document.getElementById('updateModal').style.display = 'block';
    document.getElementById('updateOutput').style.display = 'none';
}

// Save update
async function saveUpdate() {
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value.trim();
    const type = document.getElementById('updateType').value;
    const output = document.getElementById('updateOutput');

    if (!name) {
        output.style.display = 'block';
        output.textContent = 'Error: Category name is required';
        output.style.color = 'red';
        return;
    }

    const isGlobal = document.getElementById('makeGlobal').checked;

    try {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                type,
                is_global: isGlobal
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update category');
        }

        output.style.display = 'block';
        output.style.color = 'green';
        output.textContent = `✅ Category updated successfully!`;

        setTimeout(() => {
            closeUpdateModal();
            loadCategories();
        }, 1500);

    } catch (error) {
        output.style.display = 'block';
        output.style.color = 'red';
        output.textContent = `❌ Error: ${error.message}`;
    }
}

// Delete category
async function deleteCategory(id, name) {
    if (!confirm(`Are you sure you want to delete the category "${name}"?\n\nThis will affect all users who use this category.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete category');
        }

        alert(`✅ Category "${name}" deleted successfully!`);
        loadCategories();

    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// Close update modal
function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('updateModal');
    if (e.target === modal) {
        closeUpdateModal();
    }
});
