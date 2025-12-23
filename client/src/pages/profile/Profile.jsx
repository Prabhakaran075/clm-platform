import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Mail, Phone, Building, Briefcase,
    Shield, Edit3, ChevronRight, MapPin,
    Calendar, BadgeCheck, ExternalLink,
    Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const Profile = () => {
    const { updateUser } = useAuth();
    const { showAlert } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/api/auth/profile');
                setUser(data);
                setEditData(data);
                if (data.avatar) setAvatarPreview(data.avatar);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);


    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(editData).forEach(key => {
                if (key === 'avatar') return; // Skip old avatar path
                if (editData[key] !== null && editData[key] !== undefined) {
                    formData.append(key, editData[key]);
                }
            });
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const { data } = await axios.put('/api/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(prev => ({ ...prev, ...data }));
            if (data.avatar) setAvatarPreview(data.avatar);
            setAvatarFile(null);

            // Sync with global auth state for Navbar
            updateUser(data);
            setIsEditing(false);
            showAlert('Profile updated successfully!', 'success');
        } catch (error) {
            showAlert(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <Skeleton className="w-full h-64 rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 rounded-3xl" />
                    <Skeleton className="h-48 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!user) return null;

    const sections = [
        {
            title: 'About Me',
            icon: User,
            items: [
                { label: 'Full Name', key: 'name', value: user.name, icon: User },
                { label: 'Email Address', key: 'email', value: user.email, icon: Mail },
                { label: 'Mobile Number', key: 'mobile', value: user.mobile || 'Not set', icon: Phone },
                { label: 'Department', key: 'department', value: user.department || 'Not assigned', icon: Briefcase },
            ]
        },
        {
            title: 'Organization',
            icon: Building,
            items: [
                { label: 'Business Name', key: 'businessName', value: user.businessName || 'Not set', icon: Building },
                { label: 'Industry', key: 'businessCategory', value: user.businessCategory || 'Not set', icon: Briefcase },
                { label: 'Registered On', key: 'createdAt', value: new Date(user.createdAt || Date.now()).toLocaleDateString(), icon: Calendar, readOnly: true },
                { label: 'Account Role', key: 'role', value: user.role, icon: Shield, readOnly: true },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">

            {/* Header / Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden glass-card p-8 md:p-12 text-center"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <User size={200} />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-4xl md:text-6xl font-bold shadow-2xl shadow-indigo-200 border-4 border-white mb-6 overflow-hidden">
                            {avatarPreview ? (
                                <img src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:4001${avatarPreview}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.name?.charAt(0)
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-indigo-600 cursor-pointer hover:scale-110 transition-transform border border-slate-100">
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
                        )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                        <BadgeCheck size={20} className="text-indigo-500" />
                    </div>
                    <p className="text-slate-500 font-medium mb-8">
                        {user.role} • {user.department || 'General Management'}
                    </p>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary px-8 flex items-center gap-2 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
                        >
                            <Edit3 size={18} />
                            Edit Profile Details
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary px-8 flex items-center gap-2 py-3 rounded-2xl shadow-lg shadow-indigo-500/20"
                                >
                                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => { setIsEditing(false); setEditData(user); setAvatarPreview(user.avatar); setAvatarFile(null); }}
                                    className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            {avatarPreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAvatarPreview(null);
                                        setAvatarFile(null);
                                        setEditData({ ...editData, removeAvatar: 'true' });
                                    }}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                                >
                                    Remove Profile Photo
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (idx + 1) }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <section.icon size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">{section.title}</h3>
                        </div>

                        <div className="space-y-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="mt-1 p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors h-fit">
                                        <item.icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        {isEditing && !item.readOnly ? (
                                            <input
                                                type="text"
                                                className="form-input py-1 px-2 text-sm font-semibold"
                                                value={editData[item.key] || ''}
                                                onChange={(e) => setEditData({ ...editData, [item.key]: e.target.value })}
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-700 line-clamp-1">{item.value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Organization Description */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
            >
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Organization Overview</h4>
                {isEditing ? (
                    <textarea
                        rows={3}
                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-100"
                        value={editData.businessDescription || ''}
                        onChange={(e) => setEditData({ ...editData, businessDescription: e.target.value })}
                        placeholder="Tell us about your organization..."
                    />
                ) : (
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {user.businessDescription || 'No description provided.'}
                    </p>
                )}
            </motion.div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link to="/settings?tab=security" className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                    <Shield size={14} /> Security Settings
                </Link>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:block mt-1"></div>
                <Link to="/settings?tab=company" className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                    <Building size={14} /> Business Account
                </Link>
            </div>
        </div>
    );
};

export default Profile;
