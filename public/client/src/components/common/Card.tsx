import React from 'react';
import clsx from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, title, action }) => {
    return (
        <div className={clsx('bg-bg-card border border-border rounded-xl shadow-sm', className)}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    {title && <h3 className="text-lg font-heading font-semibold text-text-primary">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};

export default Card;
