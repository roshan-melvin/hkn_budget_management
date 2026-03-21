import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, Calendar, FileBarChart, History, Settings, LogOut, MapPin, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: PieChart, label: 'Budgets', path: '/dashboard/budgets' },
        { icon: MapPin, label: 'Tracking', path: '/dashboard/tracking' },
        { icon: Calendar, label: 'Events', path: '/dashboard/events' },
        { icon: FileBarChart, label: 'Reports', path: '/dashboard/reports' },
        { icon: History, label: 'History', path: '/dashboard/history' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
        { icon: DollarSign, label: 'Transactions', path: '/dashboard/transactions' },
    ];

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!', {
            icon: '👋',
            duration: 3000,
        });
        navigate('/login', { replace: true });
    };

    return (
        <aside className="w-64 bg-bg-primary border-r border-border flex flex-col">
            <div className="p-6 flex items-center space-x-3 border-b border-border">
                <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center text-white font-bold">
                    I
                </div>
                <span className="text-lg font-heading font-bold text-text-primary">IEEE Budget</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }: { isActive: boolean }) =>
                            clsx(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
                                isActive
                                    ? 'bg-primary-blue/10 text-primary-blue font-medium'
                                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                            )
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-text-secondary hover:text-status-danger transition-colors duration-200"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
