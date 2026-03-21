async function logout() {
    try {
        // Clear local storage first
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');

        // Call backend logout
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Always redirect, even if logout fails
        window.location.href = '/';
    } catch (error) {
        console.error('Error during logout:', error);
        // Clear storage and redirect anyway
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = '/';
    }
}

// Attach to window so it can be called from HTML
window.logout = logout;
