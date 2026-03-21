import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/common/Button';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address').refine((email) => email.endsWith('@ieee.org'), 'Only @ieee.org email addresses are allowed'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Store email in sessionStorage for next steps
        sessionStorage.setItem('resetEmail', data.email);

        toast.success(`Verification code sent to ${data.email}!`);
        setIsLoading(false);
        navigate('/verify-otp');
    };

    return (
        <AuthLayout
            title="Reset Your Password"
            subtitle="Enter your email to receive a verification code"
            backLink="/login"
            backText="Back to Login"
        >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                    label="Email Address"
                    type="email"
                    registration={register('email')}
                    error={errors.email}
                    placeholder="treasurer@ieee.org"
                    helperText="We'll send a verification code to this email"
                />

                <div>
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Send Verification Code
                    </Button>
                </div>

                <div className="mt-6 text-center text-sm">
                    <span className="text-text-muted">Remember your password? </span>
                    <Link to="/login" className="font-medium text-primary-blue hover:text-primary-dark">
                        Log in here
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
