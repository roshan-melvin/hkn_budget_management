import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ExternalLink, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import clsx from 'clsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Event {
    id: number;
    name: string;
    description: string;
    start_date: number;
    end_date: number;
    category_name?: string;
    category_type?: string;
    status: 'upcoming' | 'active' | 'expired';
    is_official: boolean;
}

const API_BASE = '/api';

const Events: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await fetch(`${API_BASE}/deadlines/admin/official`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.ok && data.deadlines) {
                    setEvents(data.deadlines);
                }
            } else {
                toast.error('Failed to load events');
            }
        } catch (error) {
            console.error('Error loading events:', error);
            toast.error('Error loading events');
        } finally {
            setIsLoading(false);
        }
    };

    const { expenses } = useExpenses();

    const getEventButtonState = (event: Event) => {
        const now = Math.floor(Date.now() / 1000);
        const isApplied = expenses.some(e => e.deadlineId === event.id);

        if (isApplied) {
            return {
                label: 'Applied',
                variant: 'secondary' as const,
                disabled: true,
                icon: CheckCircle,
            };
        }

        if (now < event.start_date) {
            return {
                label: 'Not Started',
                variant: 'secondary' as const,
                disabled: true,
                icon: Clock,
            };
        } else if (now >= event.start_date && now <= event.end_date) {
            return {
                label: 'Apply Now',
                variant: 'primary' as const,
                disabled: false,
                icon: ExternalLink,
            };
        } else {
            return {
                label: 'Registration Closed',
                variant: 'secondary' as const,
                disabled: true,
                icon: AlertCircle,
            };
        }
    };

    const handleApply = (event: Event) => {
        // Navigate to event application page
        navigate(`${event.id}/apply`);
    };

    const getDaysRemaining = (endDate: number) => {
        const now = Math.floor(Date.now() / 1000);
        const daysRemaining = Math.ceil((endDate - now) / (60 * 60 * 24));
        return daysRemaining;
    };

    const isDeadlineNear = (endDate: number) => {
        const daysRemaining = getDaysRemaining(endDate);
        return daysRemaining > 0 && daysRemaining <= 5;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-text-secondary">Loading events...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary">Events</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Official HKN events, grants, and funding opportunities
                    </p>
                </div>
            </div>

            {events.length === 0 ? (
                <Card className="text-center py-12">
                    <CalendarIcon size={48} className="mx-auto text-text-muted mb-4" />
                    <p className="text-text-secondary">No events available at the moment.</p>
                    <p className="text-sm text-text-muted mt-2">Check back later for new opportunities!</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {events
                        .sort((a, b) => a.start_date - b.start_date)
                        .map((event) => {
                            const buttonState = getEventButtonState(event);
                            const daysRemaining = getDaysRemaining(event.end_date);
                            const nearDeadline = isDeadlineNear(event.end_date);

                            return (
                                <Card
                                    key={event.id}
                                    className={clsx(
                                        'transition-all hover:shadow-md',
                                        nearDeadline && 'border-l-4 border-l-status-warning'
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-text-primary">
                                                            {event.name}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                event.status === 'active'
                                                                    ? 'success'
                                                                    : event.status === 'upcoming'
                                                                        ? 'info'
                                                                        : 'default'
                                                            }
                                                        >
                                                            {event.status === 'active'
                                                                ? 'Open'
                                                                : event.status === 'upcoming'
                                                                    ? 'Upcoming'
                                                                    : 'Closed'}
                                                        </Badge>
                                                        {nearDeadline && (
                                                            <Badge variant="warning">
                                                                <Clock size={14} className="mr-1" />
                                                                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {event.description && (
                                                        <p className="text-sm text-text-secondary mb-3">
                                                            {event.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-6 text-sm text-text-secondary">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon size={16} />
                                                            <span>
                                                                <strong>Start:</strong>{' '}
                                                                {format(new Date(event.start_date * 1000), 'MMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon size={16} />
                                                            <span>
                                                                <strong>End:</strong>{' '}
                                                                {format(new Date(event.end_date * 1000), 'MMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {event.category_name && (
                                                        <div className="mt-3">
                                                            <Badge variant="default">
                                                                📁 {event.category_name}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-4">
                                            <Button
                                                variant={buttonState.variant}
                                                icon={buttonState.icon}
                                                onClick={() => !buttonState.disabled && handleApply(event)}
                                                disabled={buttonState.disabled}
                                            >
                                                {buttonState.label}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default Events;
