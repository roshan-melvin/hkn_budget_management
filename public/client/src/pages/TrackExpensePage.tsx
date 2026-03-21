import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ApprovalTimeline from '../components/tracking/ApprovalTimeline';
import FundSourceJourney from '../components/tracking/FundSourceJourney';
import { useExpenses } from '../hooks/useExpenses';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';
import { formatStatus, getStatusVariant } from '../utils/formatStatus';

const TrackExpensePage: React.FC = () => {
    const { budgetId, expenseId } = useParams<{ budgetId: string; expenseId: string }>();
    const navigate = useNavigate();
    const { expenses } = useExpenses();
    const [expense, setExpense] = useState<any>(null);

    useEffect(() => {
        const foundExpense = expenses.find(e => e.id === expenseId);
        setExpense(foundExpense);
    }, [expenseId, expenses]);

    useEffect(() => {
        // Simulate real-time status check
        const checkStatusUpdates = () => {
            // Check if status changed
            const previousStatus = sessionStorage.getItem(`expense_${expenseId}_status`);

            if (previousStatus && previousStatus !== expense?.status) {
                toast.success(
                    `Status updated to ${formatStatus(expense?.status)}!`,
                    {
                        icon: '🎉',
                        duration: 5000,
                        position: 'top-right'
                    }
                );
            }

            // Store current status
            if (expense?.status) {
                sessionStorage.setItem(`expense_${expenseId}_status`, expense.status);
            }
        };

        if (expense) {
            checkStatusUpdates();
        }
    }, [expense?.status, expenseId]);

    const getStageLabel = (stageId?: number) => {
        switch (stageId) {
            case 1: return 'Stage 1 – Request Submitted';
            case 2: return 'Stage 2 – HQ Approved, Funds to Chapter';
            case 3: return 'Stage 3 – Chapter Disbursing to User';
            default: return 'Stage 1 – Request Submitted';
        }
    };

    if (!expense) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-bg-secondary p-8">
            {/* Header */}
            <button
                onClick={() => {
                    if (budgetId === 'NA') {
                        navigate('/dashboard/tracking');
                    } else {
                        navigate(`/dashboard/budgets/${budgetId}`);
                    }
                }}
                className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {budgetId === 'NA' ? 'Back to Tracking' : 'Back to Budget Details'}
            </button>

            <div className="bg-bg-primary rounded-lg shadow-sm p-8 border border-border">
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">Expense Tracking Timeline</h1>

                {/* Expense Details Card */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12 p-4 bg-bg-secondary rounded-lg border border-border">
                    <div>
                        <p className="text-sm text-text-secondary">Item</p>
                        <p className="font-semibold text-text-primary">{expense.item}</p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Amount</p>
                        <p className="font-semibold text-lg text-text-primary">${expense.cost.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Category</p>
                        <p className="font-semibold text-text-primary">{expense.category}</p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Current Status</p>
                        <Badge
                            variant={getStatusVariant(expense.status)}
                        >
                            {formatStatus(expense.status)}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Current Stage</p>
                        <Badge variant="info">
                            {getStageLabel(expense.currentStageId)}
                        </Badge>
                    </div>
                </div>

                {/* Main Approval Timeline */}
                <div className="mb-16">
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-6">Approval Process</h2>
                    <ApprovalTimeline
                        stages={expense.statusHistory || []}
                        currentStatus={expense.status}
                    />
                </div>

                {/* Fund Source Journey */}
                <div>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-6">Fund Source Journey</h2>
                    <FundSourceJourney
                        fundedBy={expense.fundedBy}
                        fundHistory={expense.fundSourceHistory || []}
                        currentStageId={expense.currentStageId}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrackExpensePage;
