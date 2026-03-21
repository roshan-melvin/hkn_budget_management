import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const API_BASE = '/api';

const ReportViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminComments, setAdminComments] = useState('');

    useEffect(() => {
        loadReport();
        checkAdminStatus();
    }, [id]);

    const checkAdminStatus = () => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setIsAdmin(user.role === 'admin');
    };

    const loadReport = async () => {
        try {
            const response = await fetch(`${API_BASE}/event-reports/${id}`, {
                credentials: 'include'
            });

            const data = await response.json();
            if (data.ok) {
                setReport(data.report);
                setFiles(data.files || []);
            } else {
                toast.error('Report not found');
                navigate('/dashboard/tracking');
            }
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status: string) => {
        try {
            const response = await fetch(`${API_BASE}/event-reports/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    status,
                    admin_comments: adminComments
                })
            });

            const data = await response.json();
            if (data.ok) {
                toast.success(`Report ${status}`);
                loadReport();
            } else {
                toast.error(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const downloadFile = (fileId: number, filename: string) => {
        window.open(`${API_BASE}/event-reports/files/${fileId}/download`, '_blank');
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!report) {
        return <div className="p-8">Report not found</div>;
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            draft: 'default',
            submitted: 'warning',
            under_review: 'info',
            approved: 'success',
            rejected: 'error'
        };
        return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
    };

    const totalUtilized = report.utilization_breakdown
        ? Object.values(report.utilization_breakdown).reduce((sum: number, item: any) => sum + item.amount, 0)
        : 0;

    return (
        <div className="min-h-screen bg-bg-secondary p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard/tracking')}
                    className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tracking
                </button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-text-primary">
                            Event Report
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Submitted by {report.user_name} on {report.submitted_at?.localized || 'Not submitted'}
                        </p>
                    </div>
                    {getStatusBadge(report.status)}
                </div>
            </div>

            <div className="space-y-6">
                {/* Financial Summary */}
                <Card>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                        Financial Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-bg-secondary rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Funds Received</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${report.total_funds_received?.toLocaleString() || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-bg-secondary rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Funds Utilized</p>
                            <p className="text-2xl font-bold text-blue-600">
                                ${totalUtilized.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-4 bg-bg-secondary rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Remaining</p>
                            <p className={`text-2xl font-bold ${(report.total_funds_received - totalUtilized) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${((report.total_funds_received || 0) - totalUtilized).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {report.utilization_breakdown && Object.keys(report.utilization_breakdown).length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-text-primary mb-3">Utilization Breakdown</h3>
                            <div className="space-y-2">
                                {Object.entries(report.utilization_breakdown).map(([category, data]: [string, any]) => (
                                    <div key={category} className="flex justify-between items-center p-3 bg-bg-secondary rounded">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{category}</p>
                                            {data.description && (
                                                <p className="text-xs text-text-muted">{data.description}</p>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-text-primary">
                                            ${data.amount.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Event Details */}
                <Card>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                        Event Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-text-secondary">Event Date</p>
                            <p className="text-text-primary font-medium">
                                {report.event_date ? format(new Date(report.event_date * 1000), 'MMMM d, yyyy') : 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">Participants</p>
                            <p className="text-text-primary font-medium">{report.participant_count || 0}</p>
                        </div>
                    </div>
                </Card>

                {/* Guest Speakers */}
                {report.guest_speakers && report.guest_speakers.length > 0 && (
                    <Card>
                        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                            Guest Speakers
                        </h2>
                        <div className="space-y-3">
                            {report.guest_speakers.map((speaker: any, index: number) => (
                                <div key={index} className="p-4 bg-bg-secondary rounded-lg">
                                    <p className="font-medium text-text-primary">{speaker.name}</p>
                                    <p className="text-sm text-text-secondary">{speaker.role}</p>
                                    {speaker.affiliation && (
                                        <p className="text-sm text-text-muted">{speaker.affiliation}</p>
                                    )}
                                    {speaker.topic && (
                                        <p className="text-sm text-text-muted mt-1">Topic: {speaker.topic}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Resource Persons */}
                {report.resource_persons && report.resource_persons.length > 0 && (
                    <Card>
                        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                            Resource Persons
                        </h2>
                        <div className="space-y-3">
                            {report.resource_persons.map((person: any, index: number) => (
                                <div key={index} className="p-4 bg-bg-secondary rounded-lg">
                                    <p className="font-medium text-text-primary">{person.name}</p>
                                    <p className="text-sm text-text-secondary">{person.role}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Files */}
                {files.length > 0 && (
                    <Card>
                        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                            Uploaded Files
                        </h2>
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{file.original_filename}</p>
                                        <p className="text-xs text-text-muted">
                                            {file.file_type.replace('_', ' ')} • {(file.file_size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => downloadFile(file.id, file.original_filename)}
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Survey */}
                {report.survey_link && (
                    <Card>
                        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                            Survey
                        </h2>
                        <a
                            href={report.survey_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-blue hover:underline"
                        >
                            {report.survey_link}
                        </a>
                    </Card>
                )}

                {/* Admin Actions */}
                {isAdmin && report.status === 'submitted' && (
                    <Card>
                        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                            Admin Actions
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Comments
                                </label>
                                <textarea
                                    className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                                    rows={4}
                                    value={adminComments}
                                    onChange={(e) => setAdminComments(e.target.value)}
                                    placeholder="Add comments for the user..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => updateStatus('rejected')}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                                <Button onClick={() => updateStatus('approved')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Admin Comments (if any) */}
                {report.admin_comments && (
                    <Card>
                        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                            Admin Comments
                        </h2>
                        <p className="text-text-primary whitespace-pre-wrap">{report.admin_comments}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ReportViewPage;
