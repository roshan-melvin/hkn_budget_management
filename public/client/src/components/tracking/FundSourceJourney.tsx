import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface FundSourceJourneyProps {
    fundedBy: string;
    fundHistory: any[];
    currentStageId?: number;
}

const FundSourceJourney: React.FC<FundSourceJourneyProps> = ({ fundedBy, fundHistory, currentStageId }) => {
    // Generate fund source stages based on "Funded By" field
    const generateFundPath = (source: string) => {
        const paths: Record<string, any[]> = {
            'IEEE Bangalore Chapter': [
                {
                    id: 1,
                    name: 'Chapter Request',
                    location: 'Local Chapter - Bangalore',
                    icon: Building2
                },
                {
                    id: 2,
                    name: 'IEEE Bangalore Chapter',
                    location: 'Bangalore, India',
                    icon: MapPin
                },
            ],
            'IEEE Madras Regional Office': [
                {
                    id: 1,
                    name: 'Chapter Request',
                    location: 'Local Chapter - Bangalore',
                    icon: Building2
                },
                {
                    id: 2,
                    name: 'IEEE Bangalore Chapter',
                    location: 'Bangalore, India',
                    icon: MapPin
                },
                {
                    id: 3,
                    name: 'IEEE Madras Regional Office',
                    location: 'Chennai, India',
                    icon: MapPin
                },
            ],
            'IEEE Delhi Section': [
                {
                    id: 1,
                    name: 'Chapter Request',
                    location: 'Local Chapter - Bangalore',
                    icon: Building2
                },
                {
                    id: 2,
                    name: 'IEEE Delhi Section',
                    location: 'New Delhi, India',
                    icon: MapPin
                },
            ],
            'IEEE Mumbai Chapter': [
                {
                    id: 1,
                    name: 'Chapter Request',
                    location: 'Local Chapter - Bangalore',
                    icon: Building2
                },
                {
                    id: 2,
                    name: 'IEEE Mumbai Chapter',
                    location: 'Mumbai, India',
                    icon: MapPin
                },
            ],
            'HKN': [
                {
                    id: 1,
                    name: 'Request Submitted',
                    location: 'User Application',
                    icon: Building2
                },
                {
                    id: 2,
                    name: 'HKN Headquarters',
                    location: 'Piscataway, NJ, USA',
                    icon: MapPin
                },
                {
                    id: 3,
                    name: 'Local Chapter',
                    location: 'Funds Received',
                    icon: Building2
                },
            ],
        };

        return paths[source] || [
            {
                id: 1,
                name: 'Chapter Request',
                location: 'Local Chapter - Bangalore',
                icon: Building2
            }
        ];
    };

    const stages = generateFundPath(fundedBy);

    const getStageStatus = (stageId: number) => {
        // If currentStageId is provided, use it to determine status
        if (currentStageId !== undefined) {
            if (stageId < currentStageId) return 'completed';
            if (stageId === currentStageId) return 'active';
            return 'pending';
        }

        // Fallback to fundHistory if available
        const history = fundHistory || [];
        const stage = history.find((h: any) => h.stageId === stageId);

        if (stage?.status === 'completed' || stage?.status === 'processing') return 'completed';
        return 'pending';
    };

    const getStageTimestamp = (stageId: number) => {
        const stage = fundHistory?.find((h: any) => h.stageId === stageId);
        return stage ? format(new Date(stage.timestamp * 1000), 'MMM dd\nhh:mm a') : null;
    };

    return (
        <div className="bg-accent-purple/5 rounded-lg p-8">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-accent-purple">
                    Funding Source: {fundedBy}
                </p>
            </div>

            <div className="relative px-8">
                <div className="flex items-center justify-between relative">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(stage.id);
                        const timestamp = getStageTimestamp(stage.id);
                        const Icon = stage.icon;

                        return (
                            <div key={stage.id} className="flex flex-col items-center flex-1">
                                {/* Diamond Node */}
                                <motion.div
                                    initial={{ scale: 0, rotate: 0 }}
                                    animate={{ scale: 1, rotate: 45 }}
                                    transition={{ delay: index * 0.3 }}
                                    // @ts-ignore
                                    className="relative z-10"
                                >
                                    <div
                                        className={`
                      w-14 h-14 flex items-center justify-center
                      transition-all duration-500
                      ${status === 'completed'
                                                ? 'bg-accent-purple text-white shadow-lg'
                                                : status === 'active'
                                                    ? 'bg-accent-purple/80 text-white shadow-xl animate-pulse-slow'
                                                    : 'bg-bg-secondary text-text-muted border-4 border-border'
                                            }
                    `}
                                    >
                                        <div className="-rotate-45">
                                            <Icon className={`
                        w-6 h-6
                        ${status === 'pending' ? 'text-text-muted' : 'text-white'}
                      `} />
                                        </div>
                                    </div>

                                    {/* Pulse for active */}
                                    {status === 'active' && (
                                        <motion.div
                                            // @ts-ignore
                                            className="absolute inset-0 bg-accent-purple"
                                            animate={{
                                                scale: [1, 1.4, 1],
                                                opacity: [0.6, 0, 0.6],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        />
                                    )}
                                </motion.div>

                                {/* Location Name */}
                                <p className={`
                  mt-6 text-sm font-semibold text-center
                  ${status === 'active' ? 'text-accent-purple' : 'text-text-secondary'}
                `}>
                                    {stage.name}
                                </p>

                                {/* Location */}
                                <p className="mt-1 text-xs text-text-muted">
                                    {stage.location}
                                </p>

                                {/* Timestamp */}
                                {timestamp && (
                                    <p className="mt-2 text-xs text-text-muted text-center whitespace-pre-line">
                                        {timestamp}
                                    </p>
                                )}

                                {/* Status Label */}
                                <div className="mt-2">
                                    {status === 'completed' && (
                                        <span className="inline-flex items-center text-xs text-status-success">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Completed
                                        </span>
                                    )}
                                    {status === 'active' && (
                                        <span className="inline-flex items-center text-xs text-accent-purple">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Processing
                                        </span>
                                    )}
                                </div>

                                {/* Connecting Line */}
                                {index < stages.length - 1 && (
                                    <div className="absolute top-7 left-1/2 w-full h-1 -z-10">
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: index * 0.3 + 0.4, duration: 0.6 }}
                                            // @ts-ignore
                                            className={`
                        h-full origin-left
                        ${status === 'completed'
                                                    ? 'bg-accent-purple'
                                                    : status === 'active'
                                                        ? 'bg-gradient-to-r from-accent-purple to-accent-purple/50'
                                                        : 'bg-border border-t-2 border-dashed'
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
        </div>
    );
};

export default FundSourceJourney;
