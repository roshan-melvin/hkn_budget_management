import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import clsx from 'clsx';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    type = 'text',
    registration,
    error,
    helperText,
    className,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={clsx(
                        "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm transition-colors",
                        error ? "border-status-danger" : "border-border",
                        isPassword && "pr-10",
                        className
                    )}
                    {...registration}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary focus:outline-none"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>
            {error ? (
                <p className="mt-1 text-xs text-status-danger">{error.message}</p>
            ) : helperText ? (
                <p className="mt-1 text-xs text-text-muted">{helperText}</p>
            ) : null}
        </div>
    );
};

export default FormInput;
