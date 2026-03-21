import React, { useState } from 'react';
import { History as HistoryIcon, ChevronRight } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useExpenses } from '../hooks/useExpenses';
import Card from '../components/common/Card';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const History: React.FC = () => {
    const { budgets } = useBudgets();
    const { expenses } = useExpenses();
    const [selectedYear, setSelectedYear] = useState('2023-2024');

    const filteredBudgets = budgets.filter((b) => b.academicYear === selectedYear);

    const getBudgetStats = (budgetId: string, allocated: number) => {
        const budgetExpenses = expenses.filter((e) => e.budgetId === budgetId);
        const spent = budgetExpenses.reduce((acc, curr) => acc + curr.cost, 0);
        const percentage = Math.min((spent / allocated) * 100, 100);
        return { spent, percentage, remaining: allocated - spent };
    };

    const totalAllocated = filteredBudgets.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
    const totalSpent = filteredBudgets.reduce((acc, curr) => {
        const stats = getBudgetStats(curr.id, curr.allocatedAmount);
        return acc + stats.spent;
    }, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-text-primary">History</h1>
                <div className="w-48">
                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        options={[
                            { value: '2023-2024', label: '2023-2024' },
                            { value: '2022-2023', label: '2022-2023' },
                            { value: '2021-2022', label: '2021-2022' },
                        ]}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-bg-secondary border-none">
                    <p className="text-sm text-text-secondary">Total Budget</p>
                    <h2 className="text-2xl font-bold text-text-primary mt-1">${totalAllocated.toLocaleString()}</h2>
                </Card>
                <Card className="bg-bg-secondary border-none">
                    <p className="text-sm text-text-secondary">Total Spent</p>
                    <h2 className="text-2xl font-bold text-text-primary mt-1">${totalSpent.toLocaleString()}</h2>
                </Card>
                <Card className="bg-bg-secondary border-none">
                    <p className="text-sm text-text-secondary">Utilization</p>
                    <h2 className="text-2xl font-bold text-text-primary mt-1">
                        {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}%
                    </h2>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-heading font-semibold text-text-primary">Archived Budgets</h2>
                {filteredBudgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBudgets.map((budget) => {
                            const stats = getBudgetStats(budget.id, budget.allocatedAmount);
                            return (
                                <Card key={budget.id} className="opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-heading font-semibold text-text-primary">{budget.name}</h3>
                                            <Badge variant="default">Archived</Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-text-secondary">Allocated</span>
                                                <span className="font-medium text-text-primary">${budget.allocatedAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-text-secondary">Final Spend</span>
                                                <span className="font-medium text-text-primary">
                                                    ${stats.spent.toLocaleString()} ({stats.percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-text-secondary rounded-full"
                                                    style={{ width: `${stats.percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border flex justify-end">
                                            <Button variant="ghost" size="sm" disabled>
                                                View Details <ChevronRight size={16} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-bg-card border border-border rounded-xl">
                        <HistoryIcon size={48} className="mx-auto text-text-muted mb-4" />
                        <p className="text-text-secondary">No records found for {selectedYear}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
