import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/common/Button';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import { updatePassword } from '../../utils/mockAuth';

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must include uppercase letter')
        .regex(/[a-z]/, 'Password must include lowercase letter')
        .regex(/[0-9]/, 'Password must include number')
        .regex(/[!@#$%^&*]/, 'Password must include special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const email = sessionStorage.getItem('resetEmail');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch('password');

    React.useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!email) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const success = updatePassword();

        if (success) {
            toast.success('Password reset successfully!');
            sessionStorage.removeItem('resetEmail');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            toast.error('Failed to reset password. User not found.');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create New Password"
            subtitle="Choose a strong password for your account"
            backLink="/login"
            backText="Back to Login"
        >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <FormInput
                        label="New Password *"
                        type="password"
                        registration={register('password')}
                        error={errors.password}
                        placeholder="••••••••"
                    />
                    <PasswordStrengthIndicator password={password} />
                </div>

                <FormInput
                    label="Confirm New Password *"
                    type="password"
                    registration={register('confirmPassword')}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                />

                <div>
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Reset Password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
