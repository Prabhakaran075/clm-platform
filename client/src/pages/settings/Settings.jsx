import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    User, Lock, Building, Bell, ChevronRight,
    Save, Key, Shield, UserCircle, Globe,
    FileText, CheckCircle2, AlertCircle, Edit3, Activity
} from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const { updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        mobile: '',
        businessName: '',
        businessCategory: '',
        businessDescription: '',
        department: '',
        avatar: '',
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Password State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Audit Logs State
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/api/auth/profile');
                setProfile(data);
                if (data.avatar) {
                    setAvatarPreview(data.avatar);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'audit') {
            const fetchAuditLogs = async () => {
                setAuditLoading(true);
                try {
                    const { data } = await axios.get('/api/audit');
                    setAuditLogs(data);
                } catch (error) {
                    console.error('Error fetching audit logs:', error);
                } finally {
                    setAuditLoading(false);
                }
            };
            fetchAuditLogs();
        }
    }, [activeTab]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['profile', 'company', 'security', 'notifications', 'audit'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                if (key === 'avatar') return; // Skip old avatar path
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key]);
                }
            });
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const { data } = await axios.put('/api/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProfile(prev => ({ ...prev, ...data }));
            if (data.avatar) setAvatarPreview(data.avatar);
            setAvatarFile(null);

            // Sync with global auth state for Navbar
            updateUser(data);
            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showMessage('error', 'Passwords do not match');
        }
        setSaving(true);
        try {
            await axios.put('/api/auth/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMessage('success', 'Password updated successfully!');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: UserCircle },
        { id: 'company', label: 'Organization', icon: Building },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'audit', label: 'Audit Logs', icon: Activity },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and organization settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Responsive Navigation */}
                <div className="lg:col-span-1 space-y-1">
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                            : "bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-white/5"
                                    )}
                                >
                                    <Icon size={18} className={cn(
                                        "transition-colors",
                                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                    )} />
                                    {tab.label}
                                    {isActive && <ChevronRight size={14} className="ml-auto hidden lg:block opacity-60" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="glass-card p-6 md:p-8 relative overflow-hidden"
                        >
                            {/* Success/Error Message */}
                            <AnimatePresence>
                                {message.text && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className={cn(
                                            "fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
                                            message.type === 'success' ? "bg-emerald-600 text-white border-emerald-500" : "bg-red-600 text-white border-red-500"
                                        )}
                                    >
                                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                        <span className="font-bold text-sm tracking-wide">{message.text}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-3xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:4001${avatarPreview}`} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile.name?.charAt(0)
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-xl border-4 border-white flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform group-hover:bg-indigo-700">
                                                <Edit3 size={18} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setAvatarFile(file);
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setAvatarPreview(reader.result);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h3>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{profile.role} account</p>
                                                {avatarPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAvatarPreview(null);
                                                            setAvatarFile(null);
                                                            setProfile({ ...profile, removeAvatar: 'true' });
                                                        }}
                                                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                                                    >
                                                        Remove Photo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Mobile Number</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="+91 00000 00000"
                                                value={profile.mobile || ''}
                                                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Department</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g. Finance, Legal"
                                                value={profile.department || ''}
                                                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary px-8 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <> <Save size={18} /> Save Changes </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Company Tab */}
                            {activeTab === 'company' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="pb-4 border-b border-slate-50 dark:border-white/5">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Organization Settings</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure your business identity and details</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Business Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={profile.businessName || ''}
                                                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Industry Category</label>
                                            <select
                                                className="form-input"
                                                value={profile.businessCategory || ''}
                                                onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Software">Software</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Business Description</label>
                                            <textarea
                                                rows={4}
                                                className="form-input"
                                                placeholder="Tell us about your organization..."
                                                value={profile.businessDescription || ''}
                                                onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary px-8 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Building size={18} /> Update Company Info</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="pb-6 border-b border-slate-100 dark:border-white/5">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and account security</p>
                                    </div>

                                    <div className="max-w-md space-y-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={passwords.currentPassword}
                                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">New Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary px-8 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Key size={18} /> Change Password</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Audit Logs Tab */}
                            {activeTab === 'audit' && (
                                <div className="space-y-6">
                                    <div className="pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Audit Logs</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive history of all actions and changes</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const fetchAuditLogs = async () => {
                                                    setAuditLoading(true);
                                                    try {
                                                        const { data } = await axios.get('/api/audit');
                                                        setAuditLogs(data);
                                                    } catch (error) {
                                                        console.error('Error fetching audit logs:', error);
                                                    } finally {
                                                        setAuditLoading(false);
                                                    }
                                                };
                                                fetchAuditLogs();
                                            }}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 dark:text-slate-500"
                                            title="Refresh Logs"
                                        >
                                            <Activity size={18} className={auditLoading ? "animate-spin" : ""} />
                                        </button>
                                    </div>

                                    {auditLoading ? (
                                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                            <Activity className="w-10 h-10 text-indigo-500 animate-spin" />
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching logs...</p>
                                        </div>
                                    ) : auditLogs.length > 0 ? (
                                        <div className="overflow-x-auto -mx-6 md:-mx-8">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                                        <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Action</th>
                                                        <th className="px-4 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contract</th>
                                                        <th className="px-4 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Performed By</th>
                                                        <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                                    {auditLogs.map((log) => (
                                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                            <td className="px-6 md:px-8 py-4">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                                    log.action === 'Create' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                                                                        log.action === 'Edit' ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" :
                                                                            log.action === 'Approve' ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400" :
                                                                                "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                                )}>
                                                                    {log.action}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.contract?.title || 'Unknown Contract'}</p>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                                        {log.userName?.charAt(0) || 'U'}
                                                                    </div>
                                                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{log.userName || 'System'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 md:px-8 py-4 text-right">
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                                                    {new Date(log.createdAt).toLocaleString()}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center space-y-3">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-600">
                                                <FileText size={32} />
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">No Logs Found</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">There are no audit records available for your profile yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notifications Tab (Mock) */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-8">
                                    <div className="pb-4 border-b border-slate-100 dark:border-white/5">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Communication Preferences</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Control how you receive alerts and updates</p>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        {[
                                            { title: 'Contract Expiration Alerts', desc: 'Get notified 30 days before a contract expires' },
                                            { title: 'Audit Trail Updates', desc: 'Receive a summary of all changes made to your contracts' },
                                            { title: 'Security Alerts', desc: 'Important notices about login activity and password changes' },
                                            { title: 'Newsletter', desc: 'New feature announcements and platform updates' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-white/5 group hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all">
                                                <div className="space-y-0.5">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button className="btn btn-primary px-8 flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                            <Bell size={18} /> Save Preferences
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
