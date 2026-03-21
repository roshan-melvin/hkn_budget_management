import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/common/Button';
import AutocompleteInput from '../../components/auth/AutocompleteInput';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';

const signupSchema = z.object({
    chapterName: z.string().min(3, 'Chapter name must be at least 3 characters'),
    role: z.string().min(2, 'Role must be at least 2 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string()
        .email('Please enter a valid email address')
        .refine((email) => email.endsWith('@ieee.org'), 'Only @ieee.org email addresses are allowed'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must include uppercase letter')
        .regex(/[a-z]/, 'Password must include lowercase letter')
        .regex(/[0-9]/, 'Password must include number')
        .regex(/[!@#$%^&*]/, 'Password must include special character'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Service'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
    const { signup, isLoading, user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            agreeTerms: false,
        },
    });

    const password = watch('password');

    const onSubmit = async (data: SignupFormValues) => {
        try {
            const result = await signup({
                name: data.name,
                email: data.email,
                password: data.password,
                chapterName: data.chapterName,
                role: data.role,
            });

            if (result.success) {
                toast.success('Account created successfully! Please log in.');
                navigate('/login');
            } else {
                toast.error(result.error || 'Failed to create account');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Join IEEE HKN Budget Scheduler"
        >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <AutocompleteInput
                    label="IEEE HKN Chapter Organization *"
                    name="chapterName"
                    register={register('chapterName')}
                    setValue={setValue}
                    error={errors.chapterName}
                    placeholder="Start typing your university..."
                />

                <AutocompleteInput
                    label="Role *"
                    name="role"
                    register={register('role')}
                    setValue={setValue}
                    error={errors.role}
                    placeholder="e.g., Treasurer, Member"
                    fetchUrl={'/api/roles'}
                />

                <FormInput
                    label="Full Name *"
                    type="text"
                    registration={register('name')}
                    error={errors.name}
                    placeholder="John Doe"
                />

                <FormInput
                    label="Email Address *"
                    type="email"
                    registration={register('email')}
                    error={errors.email}
                    helperText="Must be an @ieee.org email address"
                    placeholder="treasurer@ieee.org"
                />

                <div>
                    <FormInput
                        label="Password *"
                        type="password"
                        registration={register('password')}
                        error={errors.password}
                        placeholder="••••••••"
                    />
                    <PasswordStrengthIndicator password={password} />
                </div>

                <FormInput
                    label="Confirm Password *"
                    type="password"
                    registration={register('confirmPassword')}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                />

                <div className="flex items-center">
                    <input
                        id="agree-terms"
                        type="checkbox"
                        className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-border rounded"
                        {...register('agreeTerms')}
                    />
                    <label htmlFor="agree-terms" className="ml-2 block text-sm text-text-primary">
                        I agree to the <Link to="#" className="text-primary-blue hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary-blue hover:underline">Privacy Policy</Link>
                    </label>
                </div>
                {errors.agreeTerms && (
                    <p className="text-xs text-status-danger mt-1">{errors.agreeTerms.message}</p>
                )}

                <div>
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Create Account
                    </Button>
                </div>

                <div className="mt-6 text-center text-sm">
                    <span className="text-text-muted">Already have an account? </span>
                    <Link to="/login" className="font-medium text-primary-blue hover:text-primary-dark">
                        Log in here
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default SignupPage;
