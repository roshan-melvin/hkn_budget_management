import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const CTASection: React.FC = () => {
    return (
        <section className="py-24 bg-bg-primary">
            <div className="container mx-auto px-4">
                <div className="bg-gradient-to-br from-primary-blue to-primary-dark rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-purple/30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                            Ready to Transform Your Chapter's Financial Management?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10">
                            Join other IEEE HKN chapters in streamlining operations and ensuring financial transparency.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup">
                                <Button
                                    size="lg"
                                    className="bg-white text-primary-blue hover:bg-blue-50 border-transparent w-full sm:w-auto text-lg px-8 py-4"
                                >
                                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-white text-white hover:bg-white/10 w-full sm:w-auto text-lg px-8 py-4"
                                >
                                    Log In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
