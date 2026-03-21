import React, { useState, useEffect } from 'react';
import { Plus, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

const budgetSchema = z.object({
    name: z.string().min(1, 'Budget name is required'),
    total_amount: z.number().min(0.01, 'Amount must be greater than 0'),
    academic_year_id: z.string().min(1, 'Academic year is required'),
    description: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface AcademicYear {
    id: number;
    name: string;
    start_date: number;
    end_date: number;
}

interface Budget {
    id: number;
    name: string;
    description?: string;
    academic_year_id: number;
    allocated_amount: number;
    used_amount: number;
    planned_amount: number;
    actual_balance: number;
    projected_balance: number;
    created_at: string;
}

const Budgets: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch academic years on mount
    useEffect(() => {
        fetchAcademicYears();
    }, []);

    // Fetch budgets when filter changes
    useEffect(() => {
        fetchBudgets();
    }, [selectedAcademicYear]);

    const fetchAcademicYears = async () => {
        try {
            const response = await fetch('/api/academic-years', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.ok && data.academic_years) {
                setAcademicYears(data.academic_years);
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
            toast.error('Failed to load academic years');
        }
    };

    const fetchBudgets = async () => {
        try {
            setIsLoading(true);
            let url = '/api/budgets';
            if (selectedAcademicYear) {
                url += `?academic_year_id=${selectedAcademicYear}`;
            }

            const response = await fetch(url, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.ok && data.budgets) {
                setBudgets(data.budgets);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
            toast.error('Failed to load budgets');
        } finally {
            setIsLoading(false);
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BudgetFormData>({
        resolver: zodResolver(budgetSchema),
    });

    const onSubmit = async (data: BudgetFormData) => {
        try {
            console.log('Submitting budget:', data);
            const response = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: data.name,
                    academic_year_id: parseInt(data.academic_year_id),
                    total_amount: data.total_amount,
                    description: data.description,
                    used_amount: 0,
                    planned_amount: 0,
                }),
            });

            const result = await response.json();
            if (result.ok) {
                toast.success('Budget created successfully');
                setIsCreateModalOpen(false);
                reset();
                fetchBudgets();
            } else {
                toast.error(result.error || 'Failed to create budget');
            }
        } catch (error) {
            console.error('Error creating budget:', error);
            toast.error('Failed to create budget');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Prevent navigation
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                const response = await fetch(`/api/budgets/${id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (response.ok) {
                    toast.success('Budget deleted successfully');
                    fetchBudgets();
                } else {
                    toast.error('Failed to delete budget');
                }
            } catch (error) {
                console.error('Error deleting budget:', error);
                toast.error('Failed to delete budget');
            }
        }
    };

    const handleFilterApply = () => {
        setIsFilterModalOpen(false);
        fetchBudgets();
    };

    const handleFilterClear = () => {
        setSelectedAcademicYear(null);
        setIsFilterModalOpen(false);
    };

    const getAcademicYearName = (id: number) => {
        const year = academicYears.find(ay => ay.id === id);
        return year ? year.name : 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-text-primary">Budget Management</h1>
                <div className="flex space-x-3">
                    <Button variant="outline" icon={Filter} onClick={() => setIsFilterModalOpen(true)}>
                        Filter {selectedAcademicYear && `(${getAcademicYearName(selectedAcademicYear)})`}
                    </Button>
                    <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                        Create Budget
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-text-secondary">Loading budgets...</p>
                </div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-text-secondary mb-4">
                        {selectedAcademicYear
                            ? `No budgets found for ${getAcademicYearName(selectedAcademicYear)}`
                            : 'No budgets created yet'}
                    </p>
                    <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                        Create Your First Budget
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const stats = {
                            spent: budget.used_amount,
                            percentage: Math.min((budget.used_amount / budget.allocated_amount) * 100, 100),
                            remaining: budget.actual_balance,
                        };
                        return (
                            <Card key={budget.id} className="hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-heading font-semibold text-text-primary">{budget.name}</h3>
                                        <p className="text-sm text-text-secondary">{getAcademicYearName(budget.academic_year_id)}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            budget.used_amount > budget.allocated_amount
                                                ? 'danger'
                                                : budget.used_amount > budget.allocated_amount * 0.75
                                                    ? 'warning'
                                                    : 'success'
                                        }
                                    >
                                        {budget.used_amount > budget.allocated_amount
                                            ? 'Over Budget'
                                            : budget.used_amount > budget.allocated_amount * 0.75
                                                ? 'High Usage'
                                                : 'On Track'}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-text-secondary">Allocated</span>
                                            <span className="font-medium text-text-primary">{formatCurrency(budget.allocated_amount, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-text-secondary">Spent</span>
                                            <span className="font-medium text-text-primary">
                                                {formatCurrency(stats.spent, currency)} ({stats.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-blue rounded-full"
                                                style={{ width: `${stats.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-text-secondary">Remaining</p>
                                            <p className="text-lg font-bold text-status-success">{formatCurrency(stats.remaining, currency)}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleDelete(e, budget.id)}
                                                className="text-status-danger hover:text-red-700 hover:bg-status-danger/10"
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/dashboard/budgets/${budget.id}`)}
                                                className="text-primary-blue hover:text-primary-dark hover:bg-primary-blue/10"
                                            >
                                                View Details <ChevronRight size={16} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filter Budgets"
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

            {/* Create Budget Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Budget"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Budget Name"
                        placeholder="e.g., IEEE Workshop 2024"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <Input
                        label={`Allocated Amount (${currency})`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.total_amount?.message}
                        {...register('total_amount', { valueAsNumber: true })}
                    />

                    <Select
                        label="Academic Year"
                        options={[
                            { value: '', label: 'Select Academic Year' },
                            ...academicYears.map(ay => ({ value: ay.id.toString(), label: ay.name }))
                        ]}
                        error={errors.academic_year_id?.message}
                        {...register('academic_year_id')}
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-text-primary">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                            rows={3}
                            placeholder="Optional description..."
                            {...register('description')}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Budget</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;
