import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import FileUploader from '../components/reports/FileUploader';
import GuestSpeakerForm from '../components/reports/GuestSpeakerForm';
import UtilizationBreakdown from '../components/reports/UtilizationBreakdown';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = '/api';

interface UploadedFile {
    id?: number;
    file?: File;
    name: string;
    size: number;
    type: string;
    preview?: string;
    uploaded?: boolean;
}

const EventReportPage: React.FC = () => {
    const { id: applicationId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reportId, setReportId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        total_funds_received: 0,
        event_date: new Date().toISOString().split('T')[0],
        participant_count: 0,
        survey_link: '',
        survey_responses_summary: ''
    });

    const [utilizationBreakdown, setUtilizationBreakdown] = useState<Record<string, { amount: number; description: string }>>({});
    const [guestSpeakers, setGuestSpeakers] = useState<any[]>([]);
    const [resourcePersons, setResourcePersons] = useState<any[]>([]);
    const [audienceDetails, setAudienceDetails] = useState({
        total: 0,
        demographics: {},
        departments: {}
    });

    const [pdfFiles, setPdfFiles] = useState<UploadedFile[]>([]);
    const [photoFiles, setPhotoFiles] = useState<UploadedFile[]>([]);
    const [surveyFiles, setSurveyFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
        loadReport();
    }, [applicationId]);

    const loadReport = async () => {
        try {
            const response = await fetch(`${API_BASE}/event-reports/application/${applicationId}`, {
                credentials: 'include'
            });

            const data = await response.json();
            if (data.ok) {
                if (data.report) {
                    const report = data.report;
                    setReportId(report.id);
                    setFormData({
                        total_funds_received: report.total_funds_received || 0,
                        event_date: report.event_date ? new Date(report.event_date * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        participant_count: report.participant_count || 0,
                        survey_link: report.survey_link || '',
                        survey_responses_summary: report.survey_responses_summary || ''
                    });
                    setUtilizationBreakdown(report.utilization_breakdown || {});
                    setGuestSpeakers(report.guest_speakers || []);
                    setResourcePersons(report.resource_persons || []);
                    setAudienceDetails(report.audience_details || { total: 0, demographics: {}, departments: {} });
                } else if (data.application) {
                    // Pre-fill from application details if report doesn't exist
                    setFormData(prev => ({
                        ...prev,
                        total_funds_received: parseFloat(data.application.approved_amount) || 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveReport = async (submit = false) => {
        setSaving(true);
        try {
            const totalUtilized = Object.values(utilizationBreakdown).reduce((sum, item) => sum + item.amount, 0);

            const reportData = {
                application_id: parseInt(applicationId!),
                total_funds_received: formData.total_funds_received,
                total_funds_utilized: totalUtilized,
                utilization_breakdown: utilizationBreakdown,
                event_date: Math.floor(new Date(formData.event_date).getTime() / 1000),
                participant_count: formData.participant_count,
                guest_speakers: guestSpeakers,
                resource_persons: resourcePersons,
                audience_details: audienceDetails,
                survey_link: formData.survey_link,
                survey_responses_summary: formData.survey_responses_summary
            };

            const response = await fetch(`${API_BASE}/event-reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(reportData)
            });

            const data = await response.json();
            if (data.ok) {
                const newReportId = data.report_id;
                setReportId(newReportId);

                // Upload files
                await uploadFiles(newReportId);

                if (submit) {
                    await submitReport(newReportId);
                } else {
                    toast.success('Report saved as draft');
                }
            } else {
                toast.error(data.error || 'Failed to save report');
            }
        } catch (error) {
            console.error('Error saving report:', error);
            toast.error('Failed to save report');
        } finally {
            setSaving(false);
        }
    };

    const uploadFiles = async (repId: number) => {
        const allFiles = [
            ...pdfFiles.filter(f => !f.uploaded && f.file).map(f => ({ ...f, type: 'pdf_report' })),
            ...photoFiles.filter(f => !f.uploaded && f.file).map(f => ({ ...f, type: 'photo' })),
            ...surveyFiles.filter(f => !f.uploaded && f.file).map(f => ({ ...f, type: 'survey_doc' }))
        ];

        for (const file of allFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file.file!);
                formData.append('file_type', file.type);

                await axios.post(`${API_BASE}/event-reports/${repId}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                });

                file.uploaded = true;
            } catch (error) {
                console.error('Error uploading file:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    };

    const submitReport = async (repId: number) => {
        try {
            const response = await fetch(`${API_BASE}/event-reports/${repId}/submit`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.ok) {
                toast.success('Report submitted for review!');
                navigate('/dashboard/tracking');
            } else {
                toast.error(data.error || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report');
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    const totalUtilized = Object.values(utilizationBreakdown).reduce((sum, item) => sum + item.amount, 0);

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
                    <h1 className="text-2xl font-heading font-bold text-text-primary">
                        Event Report Submission
                    </h1>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => saveReport(false)} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button onClick={() => saveReport(true)} disabled={saving}>
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Review
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Financial Summary */}
                <Card>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                        Financial Summary
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Total Funds Received ($) *"
                            type="number"
                            step="0.01"
                            value={formData.total_funds_received}
                            onChange={(e) => setFormData({ ...formData, total_funds_received: parseFloat(e.target.value) || 0 })}
                            required
                        />
                        <div className="p-4 bg-bg-secondary rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Total Funds Utilized</p>
                            <p className="text-2xl font-bold text-text-primary">
                                ${totalUtilized.toLocaleString()}
                            </p>
                        </div>
                        <UtilizationBreakdown
                            items={utilizationBreakdown}
                            onChange={setUtilizationBreakdown}
                            totalFunds={formData.total_funds_received}
                        />
                    </div>
                </Card>

                {/* Event Details */}
                <Card>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                        Event Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Event Date *"
                            type="date"
                            value={formData.event_date}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                            required
                        />
                        <Input
                            label="Number of Participants *"
                            type="number"
                            value={formData.participant_count}
                            onChange={(e) => setFormData({ ...formData, participant_count: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>
                </Card>

                {/* People */}
                <Card>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-6">
                        People Involved
                    </h2>
                    <div className="space-y-6">
                        <GuestSpeakerForm
                            speakers={guestSpeakers}
                            onChange={setGuestSpeakers}
                            title="Guest Speakers"
                        />
                        <GuestSpeakerForm
                            speakers={resourcePersons}
                            onChange={setResourcePersons}
                            title="Resource Persons"
                        />
                    </div>
                </Card>

                {/* Documentation */}
                <Card>
                    <h2 className="text-lg font-heading font-semibold text-text-primary mb-6">
                        Documentation
                    </h2>
                    <div className="space-y-6">
                        <FileUploader
                            fileType="pdf_report"
                            label="Event Report (PDF)"
                            accept=".pdf"
                            multiple={false}
                            files={pdfFiles}
                            onFilesChange={setPdfFiles}
                        />
                        <FileUploader
                            fileType="photo"
                            label="Event Photos"
                            accept="image/*"
                            multiple={true}
                            files={photoFiles}
                            onFilesChange={setPhotoFiles}
                        />
                        <FileUploader
                            fileType="survey_doc"
                            label="Survey Results Document"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            multiple={false}
                            files={surveyFiles}
                            onFilesChange={setSurveyFiles}
                        />
                        <Input
                            label="Survey Link (Google Forms, etc.)"
                            value={formData.survey_link}
                            onChange={(e) => setFormData({ ...formData, survey_link: e.target.value })}
                            placeholder="https://forms.gle/..."
                        />
                    </div>
                </Card>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => navigate('/dashboard/tracking')}>
                        Cancel
                    </Button>
                    <Button variant="secondary" onClick={() => saveReport(false)} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button onClick={() => saveReport(true)} disabled={saving}>
                        <Send className="w-4 h-4 mr-2" />
                        Submit for Review
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EventReportPage;
