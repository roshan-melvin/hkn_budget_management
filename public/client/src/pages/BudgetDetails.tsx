import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, Circle, DollarSign } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

// Interfaces
interface BudgetSummary {
    budget_id: number;
    budget_name: string;
    description: string;
    academic_year_id: number;
    allocated_amount: number;
    actual_income: number;
    used_amount: number;
    planned_amount: number;
    actual_balance: number;
    projected_balance: number;
    created_at: string;
}

interface Transaction {
    id: number;
    budget_id: number;
    amount: number;
    description: string;
    date: number;
    type: 'income' | 'expense';
    is_projected: number; // 0 or 1
    created_at: number;
}

// Form Schema
const transactionSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    type: z.enum(['income', 'expense']),
    is_projected: z.boolean(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const BudgetDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            is_projected: false
        }
    });

    const watchedType = watch('type');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            // Fetch Summary
            const summaryRes = await fetch(`/api/budgets/${id}/summary`, { credentials: 'include' });
            const summaryData = await summaryRes.json();

            if (summaryData.ok) {
                setSummary(summaryData.summary);
            } else {
                toast.error('Failed to load budget details');
                navigate('/dashboard/budgets');
                return;
            }

            // Fetch Transactions
            const txRes = await fetch(`/api/budgets/${id}/transactions`, { credentials: 'include' });
            const txData = await txRes.json();

            if (txData.ok) {
                setTransactions(txData.transactions);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (transaction?: Transaction, defaultType: 'income' | 'expense' = 'expense', defaultProjected: boolean = false) => {
        if (transaction) {
            setEditingTransaction(transaction);
            setValue('description', transaction.description);
            setValue('amount', transaction.amount);
            setValue('type', transaction.type);
            setValue('is_projected', transaction.is_projected === 1);
        } else {
            setEditingTransaction(null);
            reset({
                type: defaultType,
                is_projected: defaultProjected,
                amount: 0,
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data: TransactionFormData) => {
        try {
            const url = editingTransaction
                ? `/api/budgets/${id}/transactions/${editingTransaction.id}`
                : `/api/budgets/${id}/transactions`;

            const method = editingTransaction ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.ok) {
                toast.success(editingTransaction ? 'Transaction updated' : 'Transaction added');
                setIsModalOpen(false);
                fetchData(); // Refresh data
            } else {
                toast.error(result.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (transactionId: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(`/api/budgets/${id}/transactions/${transactionId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (response.ok) {
                    toast.success('Item deleted');
                    fetchData();
                } else {
                    toast.error('Failed to delete item');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Failed to delete item');
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!summary) return <div className="p-8 text-center">Budget not found</div>;

    const actualExpenses = transactions.filter(t => t.type === 'expense' && t.is_projected === 0);
    const projectedExpenses = transactions.filter(t => t.type === 'expense' && t.is_projected === 1);
    const incomeTransactions = transactions.filter(t => t.type === 'income');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/budgets')}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary">{summary.budget_name}</h1>
                    <p className="text-text-secondary">{summary.description || 'No description'}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card>
                    <p className="text-sm text-text-secondary">Allocated Income</p>
                    <p className="text-xl font-bold text-text-primary">{formatCurrency(summary.allocated_amount, currency)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Actual Income</p>
                    <p className="text-xl font-bold text-status-success">{formatCurrency(summary.actual_income, currency)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Actual Expenses</p>
                    <p className="text-xl font-bold text-status-danger">{formatCurrency(summary.used_amount, currency)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Actual Balance</p>
                    <p className={`text-xl font-bold ${summary.actual_balance >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                        {formatCurrency(summary.actual_balance, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Projected Balance</p>
                    <p className={`text-xl font-bold ${summary.projected_balance >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                        {formatCurrency(summary.projected_balance, currency)}
                    </p>
                </Card>
            </div>

            {/* Actual Income Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Actual Income</h2>
                    <Button size="sm" variant="outline" icon={Plus} onClick={() => handleOpenModal(undefined, 'income', false)}>
                        Add Income
                    </Button>
                </div>
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-3 font-medium text-text-secondary">Description</th>
                                <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
                                <th className="px-6 py-3 font-medium text-text-secondary text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {incomeTransactions.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-text-secondary">No income recorded yet</td></tr>
                            ) : (
                                incomeTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-bg-secondary/50">
                                        <td className="px-6 py-4 flex items-center">
                                            <DollarSign size={14} className="mr-2 text-status-success" />
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{format(new Date(tx.date * 1000), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4 text-right font-medium text-status-success">+{formatCurrency(tx.amount, currency)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleOpenModal(tx)} className="text-primary-blue hover:text-primary-dark"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(tx.id)} className="text-status-danger hover:text-red-700"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Actual Spends Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Actual Spends</h2>
                    <Button size="sm" icon={Plus} onClick={() => handleOpenModal(undefined, 'expense', false)}>
                        Add Spend
                    </Button>
                </div>
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-3 font-medium text-text-secondary">Description</th>
                                <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
                                <th className="px-6 py-3 font-medium text-text-secondary text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {actualExpenses.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-text-secondary">No actual spends yet</td></tr>
                            ) : (
                                actualExpenses.map(tx => (
                                    <tr key={tx.id} className="hover:bg-bg-secondary/50">
                                        <td className="px-6 py-4">{tx.description}</td>
                                        <td className="px-6 py-4 text-text-secondary">{format(new Date(tx.date * 1000), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4 text-right font-medium text-text-primary">-{formatCurrency(tx.amount, currency)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleOpenModal(tx)} className="text-primary-blue hover:text-primary-dark"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(tx.id)} className="text-status-danger hover:text-red-700"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Projected Items Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Projected Items</h2>
                    <Button size="sm" variant="outline" icon={Plus} onClick={() => handleOpenModal(undefined, 'expense', true)}>
                        Add Projected Item
                    </Button>
                </div>
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-3 font-medium text-text-secondary">Description</th>
                                <th className="px-6 py-3 font-medium text-text-secondary">Date</th>
                                <th className="px-6 py-3 font-medium text-text-secondary text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {projectedExpenses.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-text-secondary">No projected items yet</td></tr>
                            ) : (
                                projectedExpenses.map(tx => (
                                    <tr key={tx.id} className="hover:bg-bg-secondary/50">
                                        <td className="px-6 py-4 flex items-center">
                                            <Circle size={14} className="mr-2 text-status-warning" />
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{format(new Date(tx.date * 1000), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4 text-right font-medium text-text-primary">-{formatCurrency(tx.amount, currency)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleOpenModal(tx)} className="text-primary-blue hover:text-primary-dark"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(tx.id)} className="text-status-danger hover:text-red-700"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTransaction ? 'Edit Item' : 'Add Item'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Description"
                        placeholder="Item name"
                        error={errors.description?.message}
                        {...register('description')}
                    />
                    <Input
                        label={`Amount (${currency})`}
                        type="number"
                        step="0.01"
                        error={errors.amount?.message}
                        {...register('amount', { valueAsNumber: true })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            options={[
                                { value: 'expense', label: 'Expense' },
                                { value: 'income', label: 'Income' }
                            ]}
                            {...register('type')}
                        />

                        {watchedType === 'expense' && (
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="is_projected"
                                    className="rounded border-border text-primary-blue focus:ring-primary-blue"
                                    {...register('is_projected')}
                                />
                                <label htmlFor="is_projected" className="text-sm text-text-primary">Projected Item</label>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingTransaction ? 'Update' : 'Add'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BudgetDetails;
