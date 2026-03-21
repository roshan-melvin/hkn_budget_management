(async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
            // Not logged in - redirect to login
            window.location.href = '/';
            return;
        }
        const data = await response.json();
        if (data.ok && data.user) {
            if (data.user.role !== 'admin') {
                // Logged in but not admin - redirect to main app
                window.location.href = '/';
            }
            // If admin, do nothing - let the page load
        } else {
            // Invalid session
            window.location.href = '/';
        }
    } catch (e) {
        console.error('Auth check failed', e);
        // On network error, redirect to be safe
        window.location.href = '/';
    }
})();
