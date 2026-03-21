import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/Button';
import OTPInput from '../../components/auth/OTPInput';

const VerifyOTPPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('resetEmail');
        if (!storedEmail) {
            navigate('/forgot-password');
            return;
        }
        setEmail(storedEmail);

        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Accept any 6-digit code for demo
        if (/^\d{6}$/.test(otp)) {
            toast.success('Code verified!');
            navigate('/reset-password');
        } else {
            toast.error('Invalid code. Please try again.');
        }
        setIsLoading(false);
    };

    const handleResend = () => {
        if (countdown > 0) return;

        toast.success('Code resent!');
        setCountdown(60);
    };

    return (
        <AuthLayout
            title="Enter Verification Code"
            subtitle={`We sent a 6-digit code to ${email}`}
            backLink="/forgot-password"
            backText="Back"
        >
            <div className="space-y-8">
                <div className="flex justify-center">
                    <OTPInput length={6} onComplete={setOtp} />
                </div>

                <div className="text-center text-sm">
                    <span className="text-text-muted">Didn't receive code? </span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={countdown > 0}
                        className={`font-medium ${countdown > 0
                                ? 'text-text-muted cursor-not-allowed'
                                : 'text-primary-blue hover:text-primary-dark'
                            }`}
                    >
                        {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
                    </button>
                </div>

                <Button
                    type="button"
                    className="w-full"
                    isLoading={isLoading}
                    onClick={handleVerify}
                    disabled={otp.length !== 6}
                >
                    Verify Code
                </Button>
            </div>
        </AuthLayout>
    );
};

export default VerifyOTPPage;
