import { useAppContext } from '../context/AppContext';
import { Deadline } from '../types';

const API_BASE = '/api';

export const useDeadlines = () => {
    const { state, dispatch } = useAppContext();

    const addDeadline = async (deadline: Deadline) => {
        try {
            // Save to backend API
            const response = await fetch(`${API_BASE}/deadlines/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: deadline.title,
                    description: deadline.notes || '',
                    start_date: deadline.dueDate, // Use dueDate as both start and end for now
                    end_date: deadline.dueDate,
                    category_id: null, // No category for now
                }),
            });

            if (response.ok) {
                // Add to local state
                dispatch({ type: 'ADD_DEADLINE', payload: deadline });
            } else {
                console.error('Failed to save deadline to backend');
            }
        } catch (error) {
            console.error('Error saving deadline:', error);
        }
    };

    const updateDeadline = async (deadline: Deadline) => {
        try {
            // Extract numeric ID from string ID (e.g., "deadline-1" -> 1)
            const numericId = deadline.id.replace('deadline-', '');

            const response = await fetch(`${API_BASE}/deadlines/user/${numericId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: deadline.title,
                    description: deadline.notes || '',
                    start_date: deadline.dueDate,
                    end_date: deadline.dueDate,
                }),
            });

            if (response.ok) {
                dispatch({ type: 'UPDATE_DEADLINE', payload: deadline });
            } else {
                console.error('Failed to update deadline on backend');
            }
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };

    const deleteDeadline = async (id: string) => {
        try {
            // Extract numeric ID
            const numericId = id.replace('deadline-', '');

            const response = await fetch(`${API_BASE}/deadlines/user/${numericId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                dispatch({ type: 'DELETE_DEADLINE', payload: id });
            } else {
                console.error('Failed to delete deadline from backend');
            }
        } catch (error) {
            console.error('Error deleting deadline:', error);
        }
    };

    return {
        deadlines: state.deadlines,
        isLoading: state.isLoading,
        addDeadline,
        updateDeadline,
        deleteDeadline,
    };
};
