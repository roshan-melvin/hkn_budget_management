import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, CreditCard, Check } from 'lucide-react';
import { format } from 'date-fns';

const STAGES = [
    { id: 'draft', label: 'Draft', icon: FileText },
    { id: 'pending_review', label: 'Pending Review', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'payment_processing', label: 'Payment Processing', icon: CreditCard },
    { id: 'completed', label: 'Completed', icon: Check },
];

interface ApprovalTimelineProps {
    stages: any[];
    currentStatus: string;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ stages, currentStatus }) => {
    const getStageStatus = (stageId: string) => {
        const stageIndex = STAGES.findIndex(s => s.id === stageId);
        const currentIndex = STAGES.findIndex(s => s.id === currentStatus);

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    const getStageTimestamp = (stageId: string) => {
        const stage = stages?.find(s => s.stage === stageId);
        return stage ? format(new Date(stage.timestamp * 1000), 'MMM dd\nhh:mm a') : null;
    };

    return (
        <div className="relative px-8">
            {/* Timeline Container */}
            <div className="flex items-center justify-between relative">
                {STAGES.map((stage, index) => {
                    const status = getStageStatus(stage.id);
                    const timestamp = getStageTimestamp(stage.id);
                    const Icon = stage.icon;

                    return (
                        <div key={stage.id} className="flex flex-col items-center flex-1">
                            {/* Node */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.2 }}
                                // @ts-ignore
                                className="relative z-10"
                            >
                                <div
                                    className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    transition-all duration-500
                    ${status === 'completed'
                                            ? 'bg-status-success text-white shadow-lg'
                                            : status === 'active'
                                                ? 'bg-primary-blue text-white shadow-xl animate-pulse-slow'
                                                : 'bg-bg-secondary text-text-muted border-4 border-border'
                                        }
                  `}
                                >
                                    <Icon className="w-8 h-8" />
                                </div>

                                {/* Pulse effect for active stage */}
                                {status === 'active' && (
                                    <motion.div
                                        // @ts-ignore
                                        className="absolute inset-0 rounded-full bg-primary-blue"
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.5, 0, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                            </motion.div>

                            {/* Label */}
                            <p className={`
                mt-4 text-sm font-semibold text-center
                ${status === 'active' ? 'text-primary-blue' : 'text-text-secondary'}
              `}>
                                {stage.label}
                            </p>

                            {/* Timestamp */}
                            {timestamp && (
                                <p className="mt-2 text-xs text-text-muted text-center whitespace-pre-line">
                                    {timestamp}
                                </p>
                            )}

                            {/* Connecting Line */}
                            {index < STAGES.length - 1 && (
                                <div className="absolute top-8 left-1/2 w-full h-1 -z-10">
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                                        // @ts-ignore
                                        className={`
                      h-full origin-left
                      ${status === 'completed'
                                                ? 'bg-status-success'
                                                : status === 'active'
                                                    ? 'bg-gradient-to-r from-status-success to-primary-blue'
                                                    : 'bg-border border-t-2 border-dashed border-text-muted'
                                            }
                    `}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApprovalTimeline;
