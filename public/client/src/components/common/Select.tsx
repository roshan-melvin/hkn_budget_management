import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, className, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={clsx(
                        'w-full rounded-lg border bg-bg-primary px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all appearance-none',
                        error
                            ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/20'
                            : 'border-border focus:border-primary-blue focus:ring-primary-blue/20',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs text-text-secondary">{helperText}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
