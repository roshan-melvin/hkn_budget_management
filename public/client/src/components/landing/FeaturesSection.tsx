import React from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    List,
    Calendar,
    Clock,
    FileText,
    Layers
} from 'lucide-react';

const features = [
    {
        icon: PieChart,
        title: 'Real-time Balance Tracking',
        description: 'Know exactly where your chapter stands financially with live updates and visual breakdowns.',
        color: 'text-primary-blue',
        bg: 'bg-primary-blue/10'
    },
    {
        icon: List,
        title: 'IEEE-Formatted Expenses',
        description: 'Categories aligned with IEEE standards (Travel, Conferences, Promotion) for easy reporting.',
        color: 'text-accent-purple',
        bg: 'bg-accent-purple/10'
    },
    {
        icon: Calendar,
        title: 'Academic Year Planning',
        description: 'Organize finances around September-August cycles to match your officer term.',
        color: 'text-status-success',
        bg: 'bg-status-success/10'
    },
    {
        icon: Clock,
        title: 'Deadline & Grant Tracking',
        description: 'Never miss important funding opportunities with automated reminders and countdowns.',
        color: 'text-status-warning',
        bg: 'bg-status-warning/10'
    },
    {
        icon: Layers,
        title: 'Progress Tracking',
        description: 'Visual timeline showing expense approval stages from draft to final payment.',
        color: 'text-status-info',
        bg: 'bg-status-info/10'
    },
    {
        icon: FileText,
        title: 'Professional Reports',
        description: 'Export detailed PDF and CSV reports for university administrators and transparency.',
        color: 'text-primary-dark',
        bg: 'bg-primary-dark/10'
    }
];

const FeaturesSection: React.FC = () => {
    return (
        <section className="py-24 bg-bg-primary">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
                        Why This Budget Scheduler?
                    </h2>
                    <p className="text-lg text-text-secondary">
                        Managing chapter finances shouldn't be complicated. Our tool helps IEEE HKN chapters stay organized, transparent, and focused on what matters most.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            // @ts-ignore
                            className="bg-bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
