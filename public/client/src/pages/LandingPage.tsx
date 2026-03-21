import React, { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import AboutHKNSection from '../components/landing/AboutHKNSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            // If user is already logged in, redirect based on role
            if (user.role === 'admin') {
                // Use full page reload to break out of React Router and Vite proxy
                // This will hit the backend directly
                window.location.replace('/admin/index.html');
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, user, isLoading, navigate]);

    // Don't render landing page if user is logged in (prevent flash)
    if (isAuthenticated && user) {
        return <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-text-secondary">Redirecting...</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full bg-bg-primary/80 backdrop-blur-md z-50 border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-heading font-bold text-xl text-text-primary">HKN Budget</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button size="sm">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                <HeroSection />
                <AboutHKNSection />
                <FeaturesSection />
                <CTASection />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
