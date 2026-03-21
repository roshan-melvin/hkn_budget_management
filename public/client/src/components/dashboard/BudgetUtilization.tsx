import React from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useExpenses } from '../../hooks/useExpenses';

const BudgetUtilization: React.FC = () => {
    const { budgets } = useBudgets();
    const { expenses } = useExpenses();

    const budgetProgress = budgets.map((budget) => {
        const budgetExpenses = expenses.filter((e) => e.budgetId === budget.id);
        const spent = budgetExpenses.reduce((acc, curr) => acc + curr.cost, 0);
        const percentage = Math.min((spent / budget.allocatedAmount) * 100, 100);

        return {
            ...budget,
            spent,
            percentage,
        };
    });

    return (
        <div className="space-y-6">
            {budgetProgress.map((item) => (
                <div key={item.id}>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-text-primary">{item.name}</span>
                        <span className="text-text-secondary">
                            ${item.spent.toLocaleString()} / ${item.allocatedAmount.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-blue rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BudgetUtilization;
