import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
    const variants = {
        success: 'bg-status-success/10 text-status-success border-status-success/20',
        warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
        danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
        info: 'bg-status-info/10 text-status-info border-status-info/20',
        default: 'bg-bg-secondary text-text-secondary border-border',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

export default Badge;
