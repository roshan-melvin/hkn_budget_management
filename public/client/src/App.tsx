import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import BudgetDetails from './pages/BudgetDetails';
import Events from './pages/Events';
import ApplyEvent from './pages/ApplyEvent';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import TrackExpensePage from './pages/TrackExpensePage';
import TrackingList from './pages/TrackingList';
import TransactionsPage from './pages/TransactionsPage';
import EventReportPage from './pages/EventReportPage';
import ReportViewPage from './pages/ReportViewPage';

function App() {
    // Initialize dark mode from localStorage
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <AppProvider>
            <AuthProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <div className="min-h-screen bg-bg-primary transition-colors duration-200">
                        <Toaster position="top-right" />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/verify-otp" element={<VerifyOTPPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />

                            {/* Protected Dashboard Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="budgets" element={<Budgets />} />
                                <Route path="budgets/:id" element={<BudgetDetails />} />
                                <Route path="tracking" element={<TrackingList />} />
                                <Route path="budgets/:budgetId/track/:expenseId" element={<TrackExpensePage />} />
                                <Route path="events" element={<Events />} />
                                <Route path="events/:id/apply" element={<ApplyEvent />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="history" element={<History />} />
                                <Route path="settings" element={<Settings />} />
                                {/* Transaction Management */}
                                <Route path="transactions" element={<TransactionsPage />} />
                                <Route path="transactions/:applicationId" element={<TransactionsPage />} />
                                {/* Event Reports */}
                                <Route path="applications/:id/report" element={<EventReportPage />} />
                                <Route path="reports/:id" element={<ReportViewPage />} />
                            </Route>
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </AppProvider>
    );
}

export default App;
