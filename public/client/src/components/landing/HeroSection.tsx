import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

const HeroSection: React.FC = () => {
    const scrollToAbout = () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center bg-bg-primary overflow-hidden pt-16">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 via-bg-primary to-accent-purple/5 -z-10" />

            <div className="container mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary-blue/10 text-primary-blue text-sm font-medium border border-primary-blue/20">
                        For IEEE HKN Chapters Worldwide
                    </div>

                    <h1 className="text-5xl md:text-7xl font-heading font-bold text-text-primary mb-6 leading-tight">
                        Smart Budget Scheduler <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-purple">
                            for IEEE HKN
                        </span>
                    </h1>

                    <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                        Empowering student chapters to manage finances, track expenses, and achieve their mission with confidence and transparency.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg shadow-primary-blue/20 hover:shadow-primary-blue/30 transition-all">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto text-lg px-8 py-6"
                            onClick={scrollToAbout}
                        >
                            Learn More
                        </Button>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                // @ts-ignore
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
                onClick={scrollToAbout}
            >
                <ChevronDown className="text-text-muted h-8 w-8" />
            </motion.div>
        </section>
    );
};

export default HeroSection;
