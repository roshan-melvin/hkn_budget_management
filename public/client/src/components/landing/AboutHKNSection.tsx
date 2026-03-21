import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, Sparkles } from 'lucide-react';

const AboutHKNSection: React.FC = () => {
    return (
        <section id="about" className="py-24 bg-bg-secondary">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        // @ts-ignore
                        className="lg:w-1/2"
                    >
                        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-sm font-medium">
                            About IEEE-HKN
                        </div>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-6">
                            Excellence in Engineering & Science
                        </h2>
                        <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                            IEEE-Eta Kappa Nu (IEEE-HKN) is the honor society of IEEE, founded in 1904. We promote excellence in the profession and education through three core ideals:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm text-center">
                                <div className="w-12 h-12 mx-auto bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue mb-3">
                                    <GraduationCap size={24} />
                                </div>
                                <h3 className="font-semibold text-text-primary">Scholarship</h3>
                            </div>
                            <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm text-center">
                                <div className="w-12 h-12 mx-auto bg-accent-purple/10 rounded-full flex items-center justify-center text-accent-purple mb-3">
                                    <User size={24} />
                                </div>
                                <h3 className="font-semibold text-text-primary">Character</h3>
                            </div>
                            <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm text-center">
                                <div className="w-12 h-12 mx-auto bg-status-warning/10 rounded-full flex items-center justify-center text-status-warning mb-3">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="font-semibold text-text-primary">Attitude</h3>
                            </div>
                        </div>

                        <p className="text-text-secondary leading-relaxed">
                            With 260+ chapters worldwide and 200,000+ members, IEEE-HKN recognizes and encourages outstanding achievement in electrical engineering, computer engineering, computer science, and all IEEE fields of interest.
                        </p>
                    </motion.div>

                    {/* Image/Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        // @ts-ignore
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-white p-8">
                            <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="text-center">
                                    <h3 className="text-4xl font-bold text-primary-blue mb-2">IEEE-HKN</h3>
                                    <p className="text-text-secondary">Official Honor Society of IEEE</p>
                                </div>
                            </div>

                            {/* Floating Stats */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-border">
                                <p className="text-2xl font-bold text-primary-blue">260+</p>
                                <p className="text-xs text-text-secondary font-medium">Chapters Worldwide</p>
                            </div>
                            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-border">
                                <p className="text-2xl font-bold text-accent-purple">1904</p>
                                <p className="text-xs text-text-secondary font-medium">Founded</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutHKNSection;
