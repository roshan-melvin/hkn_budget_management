export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'treasurer' | 'member';
    createdAt: number;
    timezone: string;
    currency?: string;
}

export interface Budget {
    id: string;
    name: string;
    academicYear: string;
    allocatedAmount: number;
    description?: string;
    status: 'draft' | 'submitted' | 'approved' | 'locked';
    createdAt: number;
    expenses: string[]; // Array of expense IDs
}

export interface Expense {
    id: string;
    budgetId: string;
    deadlineId?: number; // Linked deadline ID for applications
    currentStageId?: number; // Current funding stage (1-3)
    item: string;
    category: string;
    subcategory?: string;
    cost: number;
    fundedBy: string;
    comments?: string;
    date: number;
    status: 'draft' | 'pending_review' | 'approved' | 'payment_processing' | 'completed' | 'rejected';
    statusHistory: StatusHistoryItem[];
    createdAt: number;
}

export interface StatusHistoryItem {
    stage: Expense['status'];
    timestamp: number;
    note?: string;
}

export interface Deadline {
    id: string;
    title: string;
    dueDate: number;
    amount?: number;
    priority: 'high' | 'medium' | 'low';
    status: 'upcoming' | 'completed' | 'overdue';
    notes?: string;
    createdAt: number;
}

export interface Category {
    id: string;
    name: string;
    subcategories?: string[];
}
