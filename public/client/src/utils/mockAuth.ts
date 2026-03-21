import { User } from '../types';

const API_BASE = '/api/auth';

export const checkAuthStatus = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/me`, { credentials: 'include' });
        const data = await response.json();

        if (response.ok && data.ok) {
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error };
    } catch (error) {
        console.error('Auth check error:', error);
        return { success: false, error: 'Network error' };
    }
};

export const mockLogin = async (email: string, password: string, chapterName?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, chapterName }),
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error' };
    }
};

export const mockSignup = async (userData: any): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        // Map frontend userData to backend expected format
        // Frontend might send 'confirmPassword' which backend doesn't need
        const payload = {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            chapterName: userData.chapterName,
            role: userData.role
        };

        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Signup failed' };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: 'Network error' };
    }
};

export const mockLogout = async () => {
    try {
        await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Deprecated/Unused functions kept for compatibility if needed, but they won't do anything useful locally
export const initializeMockAuth = () => { };
export const getRegisteredUsers = () => [];
export const getCurrentUser = () => null;
export const setCurrentUser = () => { };
export const registerUser = () => ({ id: '', email: '', name: '', role: 'treasurer', createdAt: 0 });
export const updatePassword = () => false;
