import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_BASE = '/api';

interface Event {
    id: number;
    name: string;
    description: string;
    start_date: number;
    end_date: number;
    category_name?: string;
}

const ApplyEvent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            loadEvent(id);
        }
    }, [id]);

    const loadEvent = async (eventId: string) => {
        try {
            // In a real app, we'd have a specific endpoint for getting a single event
            // For now, we'll fetch all and find the one we need
            const response = await fetch(`${API_BASE}/deadlines/admin/official`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.ok && data.deadlines) {
                    const foundEvent = data.deadlines.find((e: any) => e.id === parseInt(eventId));
                    if (foundEvent) {
                        setEvent(foundEvent);
                    } else {
                        toast.error('Event not found');
                        navigate('/dashboard/events');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading event:', error);
            toast.error('Error loading event details');
        } finally {
            setIsLoading(false);
        }
    };

    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [draftId, setDraftId] = useState<number | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const saveDraft = async () => {
        if (!notes && !amount) return; // Don't save empty drafts

        setIsSavingDraft(true);
        try {
            const combinedNotes = `Requested Amount: $${amount}\n\nStatement of Purpose:\n${notes}`;

            const response = await fetch(`${API_BASE}/deadlines/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    deadline_id: event?.id,
                    notes: combinedNotes,
                    status: 'draft'
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setDraftId(data.application_id);
                toast.success('Draft saved!');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const combinedNotes = `Requested Amount: $${amount}\n\nStatement of Purpose:\n${notes}`;

            const response = await fetch(`${API_BASE}/deadlines/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    deadline_id: event?.id,
                    notes: combinedNotes,
                    status: 'pending_review' // Explicitly set to pending_review on submit
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setIsSuccess(true);
                toast.success('Application submitted successfully!');
            } else {
                toast.error(data.error || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('Error submitting application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-text-secondary">Loading event details...</div>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto pt-8">
                <Card className="text-center py-12">
                    <div className="w-16 h-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Application Submitted!</h2>
                    <p className="text-text-secondary mb-6">
                        Your application for <strong>{event.name}</strong> has been received.
                        We will review it shortly.
                    </p>
                    <Button onClick={() => navigate('/dashboard/events')}>
                        Return to Events
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate('/dashboard/events')}
                className="pl-0 hover:bg-transparent hover:text-primary-blue"
            >
                Back to Events
            </Button>

            <Card>
                <div className="border-b border-border pb-6 mb-6">
                    <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
                        Apply for {event.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>Ends {format(new Date(event.end_date * 1000), 'MMM d, yyyy')}</span>
                        </div>
                        {event.category_name && (
                            <Badge variant="default">
                                {event.category_name}
                            </Badge>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-bg-secondary/50 p-4 rounded-lg border border-border">
                        <h3 className="font-medium text-text-primary mb-2">Event Description</h3>
                        <p className="text-sm text-text-secondary">
                            {event.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-text-primary border-b border-border pb-2">
                            Application Details
                        </h3>

                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-text-primary">
                                Statement of Purpose
                            </label>
                            <textarea
                                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                                rows={5}
                                placeholder="Why are you applying for this event/grant?"
                                required
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <Input
                            label="Requested Amount ($)"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/dashboard/events')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={saveDraft}
                            disabled={isSavingDraft || (!notes && !amount)}
                        >
                            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ApplyEvent;
