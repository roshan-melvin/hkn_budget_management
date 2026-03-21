import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import AutocompleteInput from '../../components/auth/AutocompleteInput';
import Button from '../../components/common/Button';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    chapterName: z.string().optional(),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const { login, isLoading, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    React.useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                // Redirect to Admin Panel (served by backend/proxy)
                window.location.href = '/admin/index.html';
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: true,
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const success = await login(data.email, data.password, !!data.rememberMe, data.chapterName);
            if (success) {
                toast.success('Login successful! Welcome back.');
                navigate(from, { replace: true });
            } else {
                toast.error('Invalid email or password');
            }
        } catch (error) {
            toast.error('An error occurred during login');
        }
    };

    return (
        <AuthLayout
            title="Welcome Back!"
            subtitle="Log in to IEEE HKN Budget Scheduler"
        >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <AutocompleteInput
                    label="IEEE HKN Chapter Organization"
                    name="chapterName"
                    register={register('chapterName')}
                    setValue={setValue}
                    error={errors.chapterName}
                    placeholder="Start typing your university..."
                />

                <FormInput
                    label="Email Address"
                    type="email"
                    registration={register('email')}
                    error={errors.email}
                    placeholder="treasurer@ieee.org"
                />

                <FormInput
                    label="Password"
                    type="password"
                    registration={register('password')}
                    error={errors.password}
                    placeholder="••••••••"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-border rounded"
                            {...register('rememberMe')}
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-text-primary">
                            Remember me
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-primary-blue hover:text-primary-dark">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <div>
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Log In
                    </Button>
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-bg-card text-text-muted">
                                Don't have an account?
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/signup" className="font-medium text-primary-blue hover:text-primary-dark">
                            Sign up here
                        </Link>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
