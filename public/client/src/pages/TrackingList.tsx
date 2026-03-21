import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import { formatStatus, getStatusVariant } from '../utils/formatStatus';
import { format } from 'date-fns';

const TrackingList: React.FC = () => {
    const navigate = useNavigate();
    const { expenses } = useExpenses();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredExpenses = expenses.filter(expense =>
        expense.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.fundedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary">Expense Tracking</h1>
                    <p className="text-text-secondary">Track the status and funding journey of all expenses</p>
                </div>
            </div>

            <Card className="bg-bg-card">
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                        <Input
                            placeholder="Search expenses..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium text-text-secondary">Item</th>
                                <th className="px-6 py-4 font-medium text-text-secondary">Date</th>
                                <th className="px-6 py-4 font-medium text-text-secondary">Amount</th>
                                <th className="px-6 py-4 font-medium text-text-secondary">Status</th>
                                <th className="px-6 py-4 font-medium text-text-secondary">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-bg-secondary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="max-w-[200px]">
                                            <p className="font-medium text-text-primary truncate" title={expense.item}>{expense.item}</p>
                                            <p className="text-xs text-text-secondary truncate" title={expense.category}>{expense.category}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">
                                        {format(new Date(expense.date * 1000), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-primary">
                                        ${expense.cost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusVariant(expense.status)}>
                                            {formatStatus(expense.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/dashboard/budgets/${expense.budgetId}/track/${expense.id}`)}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-accent-purple bg-accent-purple/10 rounded-md hover:bg-accent-purple/20 transition-colors"
                                        >
                                            <MapPin className="w-3 h-3 mr-1.5" />
                                            Track
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                                        No expenses found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default TrackingList;
