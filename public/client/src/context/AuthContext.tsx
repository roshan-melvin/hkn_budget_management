import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockLogin, mockSignup, mockLogout, checkAuthStatus } from '../utils/mockAuth';
import { useAppContext } from './AppContext';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe: boolean, chapterName?: string) => Promise<boolean>;
    signup: (userData: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state, dispatch, logout: appLogout } = useAppContext();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // First, try to restore from local/session storage (client-side persistence)
            try {
                const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const normalized = {
                        ...parsed,
                        username: parsed.username || parsed.name || parsed.email,
                    } as User;

                    setUser(normalized);
                    setIsAuthenticated(true);
                    // populate AppContext so other components reflect the restored user
                    try {
                        dispatch({
                            type: 'SET_INITIAL_DATA',
                            payload: { budgets: [], expenses: [], deadlines: [], user: normalized },
                        });
                    } catch (e) {
                        console.warn('Could not dispatch restored user to AppContext', e);
                    }
                    setIsLoading(false);
                    // Continue to refresh from backend in background to pick up any missing fields (createdAt, role, etc.)
                }
            } catch (err) {
                console.warn('Failed to parse stored user', err);
            }

            // Fallback: ask backend (if it supports a /me endpoint)
            const result = await checkAuthStatus();
            if (result.success && result.user) {
                const normalized = {
                    ...result.user,
                    username: (result.user as any).username || (result.user as any).name || (result.user as any).email,
                } as User;
                setUser(normalized);
                setIsAuthenticated(true);
                localStorage.setItem('currentUser', JSON.stringify(normalized));
                // Populate AppContext so UI shows the correct currentUser (navbar, etc.)
                try {
                    dispatch({ type: 'SET_INITIAL_DATA', payload: { budgets: [], expenses: [], deadlines: [], user: normalized } });
                } catch (e) {
                    console.warn('Could not dispatch user to AppContext', e);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const refreshUser = async () => {
        try {
            const result = await checkAuthStatus();
            if (result.success && result.user) {
                const normalized = {
                    ...result.user,
                    username: (result.user as any).username || (result.user as any).name || (result.user as any).email,
                } as User;
                setUser(normalized);
                setIsAuthenticated(true);
                try {
                    dispatch({ type: 'SET_INITIAL_DATA', payload: { budgets: [], expenses: [], deadlines: [], user: normalized } });
                } catch (e) {
                    console.warn('Could not dispatch refreshed user to AppContext', e);
                }
                try { localStorage.setItem('currentUser', JSON.stringify(normalized)); sessionStorage.setItem('currentUser', JSON.stringify(normalized)); } catch (e) { }
            }
        } catch (err) {
            console.warn('refreshUser failed', err);
        }
    };

    // Sync with AppContext state if needed, but AuthContext is primary for auth
    useEffect(() => {
        if (state.currentUser && !user) {
            setUser(state.currentUser);
            setIsAuthenticated(true);
        }
    }, [state.currentUser]);

    const login = async (email: string, password: string, rememberMe: boolean, chapterName?: string) => {
        setIsLoading(true);
        try {
            const result = await mockLogin(email, password, chapterName);
            if (result.success && result.user) {
                const normalized = {
                    ...result.user,
                    username: (result.user as any).username || (result.user as any).name || (result.user as any).email,
                } as User;
                setUser(normalized);
                setIsAuthenticated(true);
                // Persist normalized user
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(normalized));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(normalized));
                }

                // Populate AppContext so components using AppContext.currentUser reflect login
                try {
                    dispatch({
                        type: 'SET_INITIAL_DATA',
                        payload: {
                            budgets: [],
                            expenses: [],
                            deadlines: [],
                            user: normalized,
                        },
                    });
                } catch (e) {
                    console.warn('Could not dispatch to AppContext', e);
                }

                // Ensure we refresh canonical user fields (createdAt, role, etc.) from backend
                try {
                    await refreshUser();
                } catch (e) {
                    // non-fatal
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (userData: any) => {
        setIsLoading(true);
        try {
            const result = await mockSignup(userData);
            if (result.success) {
                // Do NOT auto-login. Just return success.
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'An unexpected error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await mockLogout();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        appLogout(); // Clear AppContext data
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
