// Admin Academic Years Management
// Admin Academic Years Management
const API_BASE = '';

// Load academic years
async function loadAcademicYears() {
    try {
        const res = await fetch(`${API_BASE}/api/academic-years`);
        const data = await res.json();

        const tbody = document.getElementById('ayTableBody');

        if (!data.academic_years || data.academic_years.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No academic years found</td></tr>';
            return;
        }

        tbody.innerHTML = data.academic_years.map(ay => {
            const isDefault = ay.user_id === null;
            const typeBadge = isDefault
                ? '<span class="badge badge-default">Admin</span>'
                : '<span class="badge badge-user">User</span>';

            const startDate = new Date(ay.start_date * 1000).toLocaleDateString();
            const endDate = new Date(ay.end_date * 1000).toLocaleDateString();

            return `
        <tr>
          <td>${ay.id}</td>
          <td>${ay.name}</td>
          <td>${startDate}</td>
          <td>${endDate}</td>
          <td>${typeBadge}</td>
          <td>
              <button class="success" onclick="editAY(${ay.id}, '${ay.name}', ${ay.start_date}, ${ay.end_date}, ${isDefault})">Edit</button>
              <button onclick="deleteAY(${ay.id})">Delete</button>
          </td>
        </tr>
      `;
        }).join('');
    } catch (err) {
        document.getElementById('ayTableBody').innerHTML =
            `<tr><td colspan="6" style="text-align:center;color:red">Error: ${err.message}</td></tr>`;
    }
}

// Create academic year
async function createAcademicYear() {
    const name = document.getElementById('ayName').value.trim();
    const startDate = document.getElementById('ayStartDate').value;
    const endDate = document.getElementById('ayEndDate').value;

    if (!name || !startDate || !endDate) {
        alert('Please fill in all fields');
        return;
    }

    const output = document.getElementById('createOutput');
    output.style.display = 'block';
    output.textContent = 'Creating...';

    try {
        const res = await fetch(`${API_BASE}/api/academic-years`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                start_date: Math.floor(new Date(startDate).getTime() / 1000),
                end_date: Math.floor(new Date(endDate).getTime() / 1000)
            })
        });

        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);

        if (data.ok) {
            document.getElementById('ayName').value = '';
            document.getElementById('ayStartDate').value = '';
            document.getElementById('ayEndDate').value = '';
            loadAcademicYears();
        }
    } catch (err) {
        output.textContent = 'Error: ' + err.message;
    }
}

// Edit academic year
function editAY(id, name, startDate, endDate, isDefault) {
    document.getElementById('updateId').value = id;
    document.getElementById('updateName').value = name;
    document.getElementById('updateStartDate').value = new Date(startDate * 1000).toISOString().split('T')[0];
    document.getElementById('updateEndDate').value = new Date(endDate * 1000).toISOString().split('T')[0];

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
}

// Save update
async function saveUpdate() {
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value.trim();
    const startDate = document.getElementById('updateStartDate').value;
    const endDate = document.getElementById('updateEndDate').value;

    const output = document.getElementById('updateOutput');
    output.style.display = 'block';
    output.textContent = 'Updating...';

    const isGlobal = document.getElementById('makeGlobal').checked;

    try {
        const res = await fetch(`${API_BASE}/api/academic-years/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                start_date: Math.floor(new Date(startDate).getTime() / 1000),
                end_date: Math.floor(new Date(endDate).getTime() / 1000),
                is_global: isGlobal
            })
        });

        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);

        if (data.ok) {
            setTimeout(() => {
                document.getElementById('updateModal').style.display = 'none';
                loadAcademicYears();
            }, 1000);
        }
    } catch (err) {
        output.textContent = 'Error: ' + err.message;
    }
}

// Delete academic year
async function deleteAY(id) {
    if (!confirm('Are you sure you want to delete this academic year? This will also delete all associated budgets!')) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/academic-years/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        alert(data.ok ? 'Deleted successfully!' : 'Error: ' + data.error);

        if (data.ok) {
            loadAcademicYears();
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createBtn').addEventListener('click', createAcademicYear);
    document.getElementById('refreshBtn').addEventListener('click', loadAcademicYears);
    document.getElementById('saveUpdateBtn').addEventListener('click', saveUpdate);
    document.getElementById('cancelUpdateBtn').addEventListener('click', () => {
        document.getElementById('updateModal').style.display = 'none';
    });

    // Initial load
    loadAcademicYears();
});
