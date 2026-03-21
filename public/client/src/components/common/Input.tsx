import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        'w-full rounded-lg border bg-bg-primary px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all',
                        error
                            ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/20'
                            : 'border-border focus:border-primary-blue focus:ring-primary-blue/20',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs text-text-secondary">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
