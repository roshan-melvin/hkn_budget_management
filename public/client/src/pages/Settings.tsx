import React, { useEffect, useState } from 'react';
import { User, Bell, Moon } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const auth = useAuth();

    // Prefer auth.user (canonical) when available to avoid race conditions
    const canonical = auth.user || currentUser;

    const [role, setRole] = useState<string>(canonical?.role || '');
    const [timezone, setTimezone] = useState<string | undefined>(canonical?.timezone || 'UTC');
    const [name, setName] = useState<string>(canonical?.username || '');
    const [rolesOptions, setRolesOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [currency, setCurrency] = useState<string>(canonical?.currency || 'USD');
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    // Initialize dark mode state from DOM
    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
    }, []);

    useEffect(() => {
        const src = auth.user || currentUser;
        setRole(src?.role || '');
        setTimezone(src?.timezone || 'UTC');
        setName(src?.username || '');
        setCurrency(src?.currency || 'USD');
    }, [auth.user, currentUser]);

    useEffect(() => {
        // fetch roles for dropdown
        fetch('/api/roles')
            .then((r) => r.json())
            .then((data) => {
                const opts = (data.roles || []).map((r: any) => ({ value: r.name, label: r.name }));
                setRolesOptions(opts);
            })
            .catch((e) => {
                console.warn('Could not load roles', e);
            });
    }, []);

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-2xl font-heading font-bold text-text-primary">Settings</h1>

            <Card title="Profile Information">
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue">
                            <User size={40} />
                        </div>
                        <div>
                            <Button variant="outline" size="sm">Change Avatar</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            label="Email"
                            value={currentUser?.email || ''}
                            readOnly
                        />
                        <Select
                            label="Role"
                            options={rolesOptions}
                            value={role}
                            onChange={(e: any) => setRole(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <Card title="Preferences">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Timezone"
                            options={[
                                { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
                                { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                                { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
                                { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
                                { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                                { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                            ]}
                            value={timezone}
                            onChange={(e: any) => setTimezone(e.target.value)}
                        />

                        {/* Date Format removed — use user's locale and database timestamp */}

                        <Select
                            label="Currency"
                            options={[
                                { value: 'USD', label: 'USD ($)' },
                                { value: 'EUR', label: 'EUR (€)' },
                                { value: 'GBP', label: 'GBP (£)' },
                            ]}
                            value={currency}
                            onChange={(e: any) => setCurrency(e.target.value)}
                        />
                    </div>

                    <div className="border-t border-border pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Moon size={20} className="text-text-secondary" />
                                <div>
                                    <p className="font-medium text-text-primary">Dark Mode</p>
                                    <p className="text-sm text-text-secondary">Toggle dark mode theme</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const html = document.documentElement;
                                    const newIsDark = !isDarkMode;
                                    if (newIsDark) {
                                        html.classList.add('dark');
                                        localStorage.setItem('theme', 'dark');
                                    } else {
                                        html.classList.remove('dark');
                                        localStorage.setItem('theme', 'light');
                                    }
                                    setIsDarkMode(newIsDark);
                                }}
                                className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-bg-secondary border border-border cursor-pointer"
                            >
                                <span className={`${isDarkMode ? 'translate-x-6 bg-primary-blue' : 'translate-x-0 bg-white'} inline-block w-6 h-6 transform rounded-full shadow-sm transition duration-200 ease-in-out`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Bell size={20} className="text-text-secondary" />
                                <div>
                                    <p className="font-medium text-text-primary">Email Notifications</p>
                                    <p className="text-sm text-text-secondary">Receive updates about budget approvals</p>
                                </div>
                            </div>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-primary-blue cursor-pointer">
                                <span className="translate-x-6 inline-block w-6 h-6 transform bg-white rounded-full shadow-sm transition duration-200 ease-in-out" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => { setRole(currentUser?.role || ''); setTimezone(currentUser?.timezone || 'UTC'); setName(currentUser?.username || ''); setCurrency(currentUser?.currency || 'USD'); }}>Cancel</Button>
                <Button onClick={async () => {
                    try {
                        const payload: any = { name, role, timezone, currency };
                        const res = await fetch('/api/auth/me', {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (res.ok && data.ok) {
                            // Update AppContext currentUser so UI updates (Navbar reads from AppContext)
                            const updatedUser = {
                                id: data.user.id,
                                username: data.user.name || data.user.email,
                                email: data.user.email,
                                role: data.user.role,
                                createdAt: data.user.createdAt,
                                timezone: data.user.timezone,
                                currency: data.user.currency,
                            };
                            dispatch({ type: 'SET_INITIAL_DATA', payload: { budgets: [], expenses: [], deadlines: [], user: updatedUser } });
                            // update local storage for AuthContext fallback
                            try { localStorage.setItem('currentUser', JSON.stringify(updatedUser)); sessionStorage.setItem('currentUser', JSON.stringify(updatedUser)); } catch (e) { }
                            // refresh AuthContext so both contexts are in sync
                            try { await auth.refreshUser(); } catch (e) { }
                            toast.success('Profile updated');
                        } else {
                            toast.error(data.error || 'Failed to update profile');
                        }
                    } catch (err) {
                        console.error('Error updating profile', err);
                        toast.error('Failed to update profile');
                    }
                }}>Save Changes</Button>
            </div>
        </div>
    );
};

export default Settings;
