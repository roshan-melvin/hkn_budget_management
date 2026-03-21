import React from 'react';
import { motion } from 'framer-motion';

const ScreenshotSection: React.FC = () => {
    return (
        <section className="py-24 bg-bg-secondary overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
                        See It In Action
                    </h2>
                    <p className="text-lg text-text-secondary">
                        Designed for clarity, efficiency, and ease of use.
                    </p>
                </div>

                <div className="relative">
                    {/* Main Screenshot */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        // @ts-ignore
                        className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-border bg-bg-card max-w-5xl mx-auto"
                    >
                        <div className="h-10 bg-bg-secondary border-b border-border flex items-center px-4 space-x-2">
                            <div className="w-3 h-3 rounded-full bg-status-danger/50" />
                            <div className="w-3 h-3 rounded-full bg-status-warning/50" />
                            <div className="w-3 h-3 rounded-full bg-status-success/50" />
                        </div>
                        <div className="aspect-[16/9] bg-bg-secondary/30 flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-full max-w-3xl mx-auto h-64 bg-white rounded-lg shadow-sm border border-border mb-4 flex items-center justify-center">
                                    <span className="text-text-muted font-medium">Main Dashboard View</span>
                                </div>
                                <p className="text-text-secondary">Intuitive dashboard with real-time insights</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating Secondary Screenshots */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        // @ts-ignore
                        className="absolute top-1/4 -left-12 lg:left-0 w-1/3 hidden md:block z-0 transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                    >
                        <div className="rounded-lg overflow-hidden shadow-xl border border-border bg-bg-card">
                            <div className="aspect-[4/3] bg-white flex items-center justify-center">
                                <span className="text-xs text-text-muted">Budget Details</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        // @ts-ignore
                        className="absolute bottom-1/4 -right-12 lg:right-0 w-1/3 hidden md:block z-20 transform rotate-6 hover:rotate-0 transition-transform duration-500"
                    >
                        <div className="rounded-lg overflow-hidden shadow-xl border border-border bg-bg-card">
                            <div className="aspect-[4/3] bg-white flex items-center justify-center">
                                <span className="text-xs text-text-muted">Timeline Tracker</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ScreenshotSection;
