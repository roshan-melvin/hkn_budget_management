import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-bg-secondary border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start mb-2">
                            <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center text-white font-bold mr-2">
                                H
                            </div>
                            <span className="font-heading font-bold text-xl text-text-primary">HKN Budget</span>
                        </div>
                        <p className="text-text-muted text-sm">
                            Built for IEEE HKN Chapters Worldwide
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-sm text-text-secondary">
                        <Link to="#" className="hover:text-primary-blue transition-colors">Contact</Link>
                        <Link to="#" className="hover:text-primary-blue transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-primary-blue transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-primary-blue transition-colors">Support</Link>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border text-center text-sm text-text-muted">
                    &copy; {new Date().getFullYear()} IEEE HKN Budget Scheduler. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
