import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    backLink?: string;
    backText?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    backLink = '/',
    backText = 'Back to Home'
}) => {
    return (
        <div className="min-h-screen bg-bg-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link
                    to={backLink}
                    className="flex items-center text-sm text-text-muted hover:text-primary-blue transition-colors mb-8 justify-center sm:justify-start"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {backText}
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    // @ts-ignore
                    className="text-center sm:text-left"
                >
                    <h2 className="text-3xl font-heading font-bold text-text-primary">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {subtitle}
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                // @ts-ignore
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
