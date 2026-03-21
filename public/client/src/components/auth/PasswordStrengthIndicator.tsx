import React from 'react';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

interface PasswordStrengthIndicatorProps {
    password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
    const requirements = [
        { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { id: 'uppercase', label: 'Include uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { id: 'lowercase', label: 'Include lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { id: 'number', label: 'Include number', test: (p: string) => /[0-9]/.test(p) },
        { id: 'special', label: 'Include special character', test: (p: string) => /[!@#$%^&*]/.test(p) },
    ];

    const metCount = requirements.filter(req => req.test(password)).length;
    const strength = metCount === 0 ? 0 : (metCount / requirements.length) * 100;

    let strengthColor = 'bg-border';
    if (metCount > 0) strengthColor = 'bg-status-danger';
    if (metCount >= 3) strengthColor = 'bg-status-warning';
    if (metCount === 5) strengthColor = 'bg-status-success';

    return (
        <div className="mt-2 mb-4">
            {/* Strength Bar */}
            <div className="h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden mb-2">
                <div
                    className={clsx("h-full transition-all duration-300", strengthColor)}
                    style={{ width: `${strength}%` }}
                />
            </div>

            {/* Requirements List */}
            <div className="space-y-1">
                {requirements.map((req) => {
                    const isMet = req.test(password);
                    return (
                        <div key={req.id} className="flex items-center text-xs">
                            {isMet ? (
                                <Check className="h-3 w-3 text-status-success mr-1.5" />
                            ) : (
                                <X className="h-3 w-3 text-text-muted mr-1.5" />
                            )}
                            <span className={isMet ? 'text-text-primary' : 'text-text-muted'}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
