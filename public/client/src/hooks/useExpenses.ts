import { useAppContext } from '../context/AppContext';
import { Expense } from '../types';

export const useExpenses = () => {
    const { state, dispatch } = useAppContext();

    const addExpense = (expense: Expense) => {
        dispatch({ type: 'ADD_EXPENSE', payload: expense });
    };

    const updateExpense = (expense: Expense) => {
        dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    };

    const deleteExpense = (id: string) => {
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
    };

    const getExpensesByBudget = (budgetId: string) => {
        return state.expenses.filter((e) => e.budgetId === budgetId);
    };

    return {
        expenses: state.expenses,
        isLoading: state.isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpensesByBudget,
    };
};
