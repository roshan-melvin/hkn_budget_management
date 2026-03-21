import { useAppContext } from '../context/AppContext';
import { Budget } from '../types';

export const useBudgets = () => {
    const { state, dispatch } = useAppContext();

    const addBudget = (budget: Budget) => {
        dispatch({ type: 'ADD_BUDGET', payload: budget });
    };

    const updateBudget = (budget: Budget) => {
        dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    };

    const deleteBudget = (id: string) => {
        dispatch({ type: 'DELETE_BUDGET', payload: id });
    };

    return {
        budgets: state.budgets,
        isLoading: state.isLoading,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
