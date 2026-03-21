import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-primary-blue text-white hover:bg-primary-dark focus:ring-primary-blue',
        secondary: 'bg-bg-secondary text-text-primary hover:bg-border focus:ring-text-secondary',
        outline: 'border border-border bg-transparent text-text-primary hover:bg-bg-secondary focus:ring-text-secondary',
        danger: 'bg-status-danger text-white hover:bg-red-600 focus:ring-status-danger',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary focus:ring-text-secondary',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && Icon && <Icon className={clsx('mr-2 h-4 w-4', size === 'sm' && 'h-3 w-3', size === 'lg' && 'h-5 w-5')} />}
            {children}
        </button>
    );
};

export default Button;
