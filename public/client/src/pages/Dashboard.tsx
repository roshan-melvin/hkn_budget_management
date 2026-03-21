import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, AlertCircle, Filter } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

import SpendingChart from '../components/dashboard/SpendingChart';
import TrendChart from '../components/dashboard/TrendChart';
import BudgetUtilization from '../components/dashboard/BudgetUtilization';
import { format } from 'date-fns';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Budget {
    id: number;
    name: string;
    allocated_amount: number;
    used_amount: number;
    actual_balance: number;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: number;
    type: 'income' | 'expense';
    category_id?: number;
    budget_name?: string;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface Event {
    id: number;
    name: string;
    description: string;
    end_date: number;
    status: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const currency = user?.currency || 'USD';

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => {
        fetchAcademicYears();
        fetchTransactions();
        fetchUpcomingEvents();
    }, []);

    useEffect(() => {
        fetchBudgets();
    }, [selectedAcademicYear]);

    const fetchAcademicYears = async () => {
        try {
            const response = await fetch('/api/academic-years', { credentials: 'include' });
            const data = await response.json();
            if (data.ok && data.academic_years) {
                setAcademicYears(data.academic_years);
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
        }
    };

    const fetchBudgets = async () => {
        try {
            let url = '/api/budgets';
            if (selectedAcademicYear) {
                url += `?academic_year_id=${selectedAcademicYear}`;
            }
            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();
            if (data.ok && data.budgets) {
                setBudgets(data.budgets);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/budgets/all-transactions', { credentials: 'include' });
            const data = await response.json();
            if (data.ok && data.transactions) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchUpcomingEvents = async () => {
        try {
            const response = await fetch('/api/deadlines/admin/official', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.ok && data.deadlines) {
                // Filter events ending within 5 days
                const now = Math.floor(Date.now() / 1000);

                const upcoming = data.deadlines.filter((event: any) => {
                    const daysUntilEnd = Math.ceil((event.end_date - now) / (60 * 60 * 24));
                    return daysUntilEnd > 0 && daysUntilEnd <= 5;
                });

                setUpcomingEvents(upcoming);
            }
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
        }
    };

    const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocated_amount, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.used_amount, 0);
    const remaining = totalAllocated - totalSpent;

    const getAcademicYearName = (id: number) => {
        const year = academicYears.find(ay => ay.id === id);
        return year ? year.name : 'Unknown';
    };

    const handleFilterApply = () => {
        setIsFilterModalOpen(false);
        fetchBudgets();
    };

    const handleFilterClear = () => {
        setSelectedAcademicYear(null);
        setIsFilterModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-text-primary">Dashboard</h1>
                <div className="flex items-center space-x-3">
                    <div className="text-sm text-text-secondary">
                        Academic Year: <span className="font-medium text-text-primary">
                            {selectedAcademicYear ? getAcademicYearName(selectedAcademicYear) : 'All Years'}
                        </span>
                    </div>
                    <Button variant="outline" size="sm" icon={Filter} onClick={() => setIsFilterModalOpen(true)}>
                        Filter
                    </Button>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-primary-blue to-primary-dark text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Budget</p>
                            <h2 className="text-3xl font-bold mt-1">{formatCurrency(totalAllocated, currency)}</h2>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg">
                            <ArrowUpRight className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-100">
                        <span>Across {budgets.length} active budgets</span>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-text-secondary text-sm font-medium">Remaining Balance</p>
                            <h2 className="text-3xl font-bold mt-1 text-text-primary">{formatCurrency(remaining, currency)}</h2>
                        </div>
                        <div className="p-2 bg-status-success/10 rounded-lg">
                            <ArrowDownRight className="text-status-success" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-text-secondary">
                        <span className="text-status-success font-medium">
                            {totalAllocated > 0 ? ((remaining / totalAllocated) * 100).toFixed(1) : 0}%
                        </span>
                        <span className="ml-1">of total budget available</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Spending Trends">
                        <TrendChart />
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Spending by Category">
                            <SpendingChart />
                        </Card>
                        <Card title="Budget Utilization">
                            <BudgetUtilization />
                        </Card>
                    </div>
                </div>

                {/* Sidebar Section */}
                <div className="space-y-6">
                    {/* Recent Transactions */}
                    <Card title="Recent Transactions">
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-text-secondary">No recent transactions</p>
                            ) : (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-bg-secondary rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-bold">
                                                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary truncate max-w-[120px]">{tx.description || 'Expense'}</p>
                                                <p className="text-xs text-text-secondary">{format(new Date(tx.date * 1000), 'MMM d')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-status-success' : 'text-text-primary'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                                            </p>
                                            <p className="text-xs text-text-secondary truncate max-w-[80px]">{tx.budget_name}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Upcoming Events (ending within 5 days) */}
                    <Card title="Upcoming Event Deadlines">
                        <div className="space-y-3">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-text-secondary">No events ending soon</p>
                            ) : (
                                upcomingEvents.map((event) => {
                                    const daysRemaining = Math.ceil((event.end_date - Math.floor(Date.now() / 1000)) / (60 * 60 * 24));
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-start justify-between p-3 bg-bg-secondary rounded-lg hover:bg-bg-secondary/80 transition-colors cursor-pointer"
                                            onClick={() => navigate('events')}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-text-primary">{event.name}</h4>
                                                    <Badge variant="warning">
                                                        <Clock size={12} className="mr-1" />
                                                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                                                    </Badge>
                                                </div>
                                                {event.description && (
                                                    <p className="text-xs text-text-secondary line-clamp-1">
                                                        {event.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-text-muted mt-1">
                                                    Ends: {format(new Date(event.end_date * 1000), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <AlertCircle size={16} className="text-status-warning mt-1" />
                                        </div>
                                    );
                                })
                            )}
                            {upcomingEvents.length > 0 && (
                                <button
                                    onClick={() => navigate('events')}
                                    className="w-full text-sm text-primary-blue hover:underline mt-2"
                                >
                                    View all events →
                                </button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filter Dashboard"
            >
                <div className="space-y-4">
                    <Select
                        label="Academic Year"
                        options={[
                            { value: '', label: 'All Academic Years' },
                            ...academicYears.map(ay => ({ value: ay.id.toString(), label: ay.name }))
                        ]}
                        value={selectedAcademicYear?.toString() || ''}
                        onChange={(e: any) => setSelectedAcademicYear(e.target.value ? parseInt(e.target.value) : null)}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleFilterClear}>
                            Clear Filter
                        </Button>
                        <Button type="button" onClick={handleFilterApply}>Apply Filter</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
