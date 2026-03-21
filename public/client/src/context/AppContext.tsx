import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Budget, Expense, Deadline, User } from '../types';
import budgetsData from '../mockData/budgets.json';

import deadlinesData from '../mockData/deadlines.json';


interface AppState {
    budgets: Budget[];
    expenses: Expense[];
    deadlines: Deadline[];
    currentUser: User | null;
    isLoading: boolean;
}

type Action =
    | { type: 'SET_INITIAL_DATA'; payload: { budgets: Budget[]; expenses: Expense[]; deadlines: Deadline[]; user: User } }
    | { type: 'ADD_BUDGET'; payload: Budget }
    | { type: 'UPDATE_BUDGET'; payload: Budget }
    | { type: 'DELETE_BUDGET'; payload: string }
    | { type: 'ADD_EXPENSE'; payload: Expense }
    | { type: 'UPDATE_EXPENSE'; payload: Expense }
    | { type: 'DELETE_EXPENSE'; payload: string }
    | { type: 'ADD_DEADLINE'; payload: Deadline }
    | { type: 'UPDATE_DEADLINE'; payload: Deadline }
    | { type: 'DELETE_DEADLINE'; payload: string };

const initialState: AppState = {
    budgets: [],
    expenses: [],
    deadlines: [],
    currentUser: null,
    isLoading: true,
};

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
    logout: () => void;
} | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_INITIAL_DATA':
            return {
                ...state,
                budgets: action.payload.budgets,
                expenses: action.payload.expenses,
                deadlines: action.payload.deadlines,
                currentUser: action.payload.user,
                isLoading: false,
            };
        case 'ADD_BUDGET':
            return { ...state, budgets: [...state.budgets, action.payload] };
        case 'UPDATE_BUDGET':
            return {
                ...state,
                budgets: state.budgets.map((b) => (b.id === action.payload.id ? action.payload : b)),
            };
        case 'DELETE_BUDGET':
            return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) };
        case 'ADD_EXPENSE':
            return { ...state, expenses: [...state.expenses, action.payload] };
        case 'UPDATE_EXPENSE':
            return {
                ...state,
                expenses: state.expenses.map((e) => (e.id === action.payload.id ? action.payload : e)),
            };
        case 'DELETE_EXPENSE':
            return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
        case 'ADD_DEADLINE':
            return { ...state, deadlines: [...state.deadlines, action.payload] };
        case 'UPDATE_DEADLINE':
            return {
                ...state,
                deadlines: state.deadlines.map((d) => (d.id === action.payload.id ? action.payload : d)),
            };
        case 'DELETE_DEADLINE':
            return { ...state, deadlines: state.deadlines.filter((d) => d.id !== action.payload) };
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        // Load data from backend API
        const loadData = async () => {
            // Try to restore currentUser from localStorage or sessionStorage
            let storedUser: any = null;
            try {
                const s = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                if (s) {
                    storedUser = JSON.parse(s);
                    storedUser = {
                        ...storedUser,
                        username: storedUser.username || storedUser.name || storedUser.email,
                    };
                }
            } catch (e) {
                console.warn('Failed to parse stored currentUser in AppContext', e);
            }

            // Fetch deadlines from backend API
            let fetchedDeadlines: Deadline[] = [];
            try {
                const response = await fetch('/api/deadlines/all', {
                    credentials: 'include', // Include cookies for authentication
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.ok && data.deadlines) {
                        // Transform backend deadlines to frontend format
                        fetchedDeadlines = data.deadlines.map((d: any) => ({
                            id: `deadline-${d.id}`,
                            title: d.name,
                            dueDate: d.end_date, // Use end_date as the deadline
                            amount: undefined, // Backend doesn't have amount field
                            priority: 'medium' as const, // Default priority
                            status: d.status === 'expired' ? 'completed' : 'upcoming',
                            notes: d.description || '',
                            createdAt: d.created_at,
                        }));
                    }
                } else {
                    console.warn('Failed to fetch deadlines from API, using mock data');
                    fetchedDeadlines = deadlinesData as Deadline[];
                }
            } catch (error) {
                console.warn('Error fetching deadlines, using mock data:', error);
                fetchedDeadlines = deadlinesData as Deadline[];
            }

            // Fetch applications (as expenses) from backend API
            let fetchedExpenses: Expense[] = [];
            try {
                const response = await fetch('/api/deadlines/user/applications', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.ok && data.applications) {
                        fetchedExpenses = data.applications.map((app: any) => {
                            // Use approved_amount from backend (the actual funds received)
                            const cost = parseFloat(app.approved_amount) || 0;

                            return {
                                id: `app-${app.id}`,
                                budgetId: 'NA', // No budget link yet
                                deadlineId: app.deadline_id,
                                currentStageId: app.current_stage_id || 1,
                                item: app.event_name,
                                category: app.category_name || 'General',
                                cost: cost,
                                fundedBy: 'HKN',
                                comments: app.notes,
                                date: app.applied_at?.unix || (typeof app.applied_at === 'number' ? app.applied_at : 0),
                                status: app.status,
                                statusHistory: [], // Can populate if backend tracks history
                                createdAt: app.applied_at?.unix || (typeof app.applied_at === 'number' ? app.applied_at : 0),
                            };
                        });
                    }
                } else {
                    console.warn('Failed to fetch applications, using mock data');
                    fetchedExpenses = [];
                }
            } catch (error) {
                console.warn('Error fetching applications, using mock data:', error);
                fetchedExpenses = [];
            }

            await new Promise((resolve) => setTimeout(resolve, 300)); // small simulated delay
            dispatch({
                type: 'SET_INITIAL_DATA',
                payload: {
                    budgets: budgetsData as Budget[],
                    expenses: fetchedExpenses,
                    deadlines: fetchedDeadlines,
                    user: storedUser as any, // restore stored user if present
                },
            });
        };
        loadData();
    }, []);

    const logout = () => {
        // Clear all storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('rememberMe');
        // We might want to keep registeredUsers for demo purposes, but clearing current session is key
        sessionStorage.clear();

        dispatch({
            type: 'SET_INITIAL_DATA',
            payload: {
                budgets: [],
                expenses: [],
                deadlines: [],
                user: null as any, // Force null
            },
        });
    };

    return <AppContext.Provider value={{ state, dispatch, logout }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
