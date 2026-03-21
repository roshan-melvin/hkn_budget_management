import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useDeadlines } from '../hooks/useDeadlines';
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
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import clsx from 'clsx';

const deadlineSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    amount: z.number().optional(),
    priority: z.enum(['high', 'medium', 'low']),
    notes: z.string().optional(),
});

type DeadlineFormData = z.infer<typeof deadlineSchema>;

const Deadlines: React.FC = () => {
    const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useDeadlines();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DeadlineFormData>({
        resolver: zodResolver(deadlineSchema),
        defaultValues: {
            priority: 'medium',
        },
    });

    const onSubmit = (data: DeadlineFormData) => {
        const newDeadline = {
            id: `deadline-${Date.now()}`,
            ...data,
            dueDate: new Date(data.dueDate).getTime() / 1000,
            status: 'upcoming' as const,
            createdAt: Date.now() / 1000,
        };
        addDeadline(newDeadline);
        toast.success('Deadline added successfully');
        setIsModalOpen(false);
        reset();
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        const deadline = deadlines.find((d) => d.id === id);
        if (deadline) {
            updateDeadline({
                ...deadline,
                status: currentStatus === 'upcoming' ? 'completed' : 'upcoming',
            });
            toast.success('Status updated');
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this deadline?')) {
            deleteDeadline(id);
            toast.success('Deadline deleted');
        }
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const startDay = getDay(monthStart); // 0 for Sunday

        return (
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="font-heading font-semibold text-lg">{format(currentDate, 'MMMM yyyy')}</h2>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>Next</Button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center border-b border-border bg-bg-secondary">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2 text-sm font-medium text-text-secondary">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr bg-bg-card">
                    {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-32 border-b border-r border-border bg-bg-secondary/20" />
                    ))}
                    {days.map((day: Date) => {
                        const dayDeadlines = deadlines.filter((d) => isSameDay(new Date(d.dueDate * 1000), day));
                        return (
                            <div key={day.toString()} className="h-32 border-b border-r border-border p-2 relative group hover:bg-bg-secondary/30 transition-colors">
                                <span className={clsx(
                                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                    isSameDay(day, new Date()) ? "bg-primary-blue text-white" : "text-text-secondary"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                                    {dayDeadlines.map((d) => (
                                        <div
                                            key={d.id}
                                            className={clsx(
                                                "text-xs p-1 rounded truncate cursor-pointer",
                                                d.priority === 'high' ? 'bg-status-danger/10 text-status-danger' :
                                                    d.priority === 'medium' ? 'bg-status-warning/10 text-status-warning' :
                                                        'bg-status-info/10 text-status-info'
                                            )}
                                            title={d.title}
                                        >
                                            {d.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-text-primary">Deadlines</h1>
                <div className="flex space-x-3">
                    <div className="bg-bg-card border border-border rounded-lg p-1 flex">
                        <button
                            className={clsx(
                                "p-2 rounded transition-colors",
                                viewMode === 'list' ? "bg-bg-secondary text-primary-blue" : "text-text-secondary hover:text-text-primary"
                            )}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={20} />
                        </button>
                        <button
                            className={clsx(
                                "p-2 rounded transition-colors",
                                viewMode === 'calendar' ? "bg-bg-secondary text-primary-blue" : "text-text-secondary hover:text-text-primary"
                            )}
                            onClick={() => setViewMode('calendar')}
                        >
                            <CalendarIcon size={20} />
                        </button>
                    </div>
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
                        Add Deadline
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {deadlines.sort((a, b) => a.dueDate - b.dueDate).map((deadline) => {
                        const daysRemaining = Math.ceil((deadline.dueDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysRemaining < 0 && deadline.status !== 'completed';

                        return (
                            <Card key={deadline.id} className={clsx("transition-all hover:shadow-md", deadline.status === 'completed' && "opacity-75")}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <button
                                            onClick={() => toggleStatus(deadline.id, deadline.status)}
                                            className={clsx(
                                                "mt-1 transition-colors",
                                                deadline.status === 'completed' ? "text-status-success" : "text-text-muted hover:text-primary-blue"
                                            )}
                                        >
                                            {deadline.status === 'completed' ? <CheckCircle size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-current" />}
                                        </button>
                                        <div>
                                            <h3 className={clsx("text-lg font-semibold text-text-primary", deadline.status === 'completed' && "line-through text-text-secondary")}>
                                                {deadline.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-text-secondary">
                                                <span className={clsx("flex items-center", isOverdue ? "text-status-danger font-medium" : "")}>
                                                    <Clock size={16} className="mr-1" />
                                                    {format(new Date(deadline.dueDate * 1000), 'MMM d, yyyy')}
                                                    <span className="ml-1">
                                                        ({daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? 'Due today' : 'Overdue'})
                                                    </span>
                                                </span>
                                                {deadline.amount && (
                                                    <span className="flex items-center">
                                                        <AlertCircle size={16} className="mr-1" />
                                                        ${deadline.amount.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            {deadline.notes && <p className="mt-2 text-sm text-text-secondary">{deadline.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <Badge variant={
                                            deadline.priority === 'high' ? 'danger' :
                                                deadline.priority === 'medium' ? 'warning' : 'info'
                                        }>
                                            {deadline.priority} Priority
                                        </Badge>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(deadline.id)} className="text-status-danger hover:bg-status-danger/10">
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {deadlines.length === 0 && (
                        <div className="text-center py-12 text-text-muted">
                            No deadlines found. Add one to get started.
                        </div>
                    )}
                </div>
            ) : (
                renderCalendar()
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Deadline"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Title"
                        placeholder="e.g., Grant Application"
                        error={errors.title?.message}
                        {...register('title')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Due Date"
                            type="date"
                            error={errors.dueDate?.message}
                            {...register('dueDate')}
                        />

                        <Select
                            label="Priority"
                            options={[
                                { value: 'high', label: 'High' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'low', label: 'Low' },
                            ]}
                            error={errors.priority?.message}
                            {...register('priority')}
                        />
                    </div>

                    <Input
                        label="Associated Amount ($)"
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        {...register('amount', { valueAsNumber: true })}
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-text-primary">Notes</label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                            rows={3}
                            placeholder="Additional details..."
                            {...register('notes')}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Deadline</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Deadlines;
