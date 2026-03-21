import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, DollarSign, Calendar } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';

const API_BASE = '/api';

interface Application {
    id: number;
    event_name: string;
    category_name: string;
    approved_amount: number;
    current_stage_id: number;
    applied_at: any;
    notes: string;
}

const TransactionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [fundedEvents, setFundedEvents] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const response = await fetch(`${API_BASE}/deadlines/user/applications`, {
                credentials: 'include'
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (data.ok && data.applications) {
                console.log('All applications:', data.applications);

                // Filter applications that have reached stage 3 (Funds Received)
                const funded = data.applications.filter((app: Application) =>
                    (app.current_stage_id || 0) >= 3
                );

                console.log('Funded events (stage >= 3):', funded);
                setFundedEvents(funded);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            toast.error('Failed to load funded events');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-bg-secondary p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary">
                        Transaction Management
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Manage funds and submit reports for completed fund transfers
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6">
                {fundedEvents.length === 0 ? (
                    <div className="text-center py-12 bg-bg-primary rounded-lg border border-border">
                        <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-text-muted" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Funds Received Yet</h3>
                        <p className="text-text-secondary max-w-md mx-auto">
                            Events will appear here once their funds have been disbursed to the Local Chapter.
                        </p>
                    </div>
                ) : (
                    fundedEvents.map(event => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-heading font-semibold text-xl text-text-primary">
                                            {event.event_name}
                                        </h3>
                                        <Badge variant="success">Funds Received</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center text-text-secondary">
                                            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="font-medium text-green-600">
                                                ${(event.approved_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-text-secondary">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>
                                                {new Date(
                                                    event.applied_at?.unix
                                                        ? event.applied_at.unix * 1000
                                                        : typeof event.applied_at === 'number'
                                                            ? event.applied_at * 1000
                                                            : Date.now()
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-text-secondary">
                                            <FileText className="w-4 h-4 mr-2" />
                                            <span>{event.category_name || 'General'}</span>
                                        </div>
                                        <div className="flex items-center text-text-secondary">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>HKN</span>
                                        </div>
                                    </div>

                                    {event.notes && (
                                        <p className="text-sm text-text-muted mt-4 bg-bg-secondary p-3 rounded-md">
                                            {event.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                                    <p className="text-sm text-text-secondary mb-3 text-center md:text-left">
                                        Submit report and utilization details
                                    </p>
                                    <Button
                                        className="w-full justify-center"
                                        onClick={() => navigate(`/dashboard/applications/${event.id}/report`)}
                                    >
                                        Manage Fund
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
