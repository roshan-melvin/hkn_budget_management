import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineTrackerProps {
    stages: {
        id: string;
        label: string;
        status: 'completed' | 'active' | 'pending';
        date?: number;
    }[];
}

const TimelineTracker: React.FC<TimelineTrackerProps> = ({ stages }) => {
    return (
        <div className="w-full overflow-x-auto py-4">
            <div className="flex items-start min-w-[600px] justify-between relative">
                {/* Connecting Line Background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-border -z-10" />

                {/* Active/Completed Line Overlay */}
                <div
                    className="absolute top-5 left-0 h-1 bg-status-success -z-10 transition-all duration-500"
                    style={{
                        width: `${(stages.findIndex(s => s.status === 'active') / (stages.length - 1)) * 100}%`
                    }}
                />

                {stages.map((stage) => (
                    <div key={stage.id} className="flex flex-col items-center relative group">
                        {/* Node */}
                        <div
                            className={clsx(
                                'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10',
                                stage.status === 'completed' && 'bg-status-success border-status-success text-white',
                                stage.status === 'active' && 'bg-primary-blue border-primary-blue text-white shadow-[0_0_0_4px_rgba(37,99,235,0.2)] scale-110',
                                stage.status === 'pending' && 'bg-bg-primary border-border text-text-muted'
                            )}
                        >
                            {stage.status === 'completed' ? (
                                <Check size={16} strokeWidth={3} />
                            ) : (
                                <div className={clsx('w-3 h-3 rounded-full', stage.status === 'active' ? 'bg-white' : 'bg-border')} />
                            )}
                        </div>

                        {/* Label */}
                        <div className="mt-3 text-center">
                            <p
                                className={clsx(
                                    'text-sm font-medium whitespace-nowrap',
                                    stage.status === 'active' ? 'text-primary-blue' : 'text-text-secondary'
                                )}
                            >
                                {stage.label}
                            </p>
                            {stage.date && (
                                <p className="text-xs text-text-muted mt-1">
                                    {format(new Date(stage.date * 1000), 'MMM d, yyyy')}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineTracker;
