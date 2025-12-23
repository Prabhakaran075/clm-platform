import { Bell, Search, User, LogOut, ChevronDown, Menu, Settings as SettingsIcon, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import axios from '../../utils/axiosConfig';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [aiSummary, setAiSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await axios.get('/api/notifications');
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (user) {
            fetchNotifications();
            // Poll for new notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const fetchAiSummary = async () => {
            if (isNotificationsOpen && unreadCount > 0) {
                setLoadingSummary(true);
                try {
                    const { data } = await axios.get('/api/notifications/ai-summary');
                    setAiSummary(data.summary);
                } catch (error) {
                    console.error('Error fetching AI summary:', error);
                } finally {
                    setLoadingSummary(false);
                }
            }
        };

        if (isNotificationsOpen) {
            fetchAiSummary();
        } else {
            setAiSummary(null);
        }
    }, [isNotificationsOpen, unreadCount]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 transition-all duration-500">
            {/* Left: Mobile Menu Toggle & Search */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 md:hidden transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="relative w-64 hidden md:block group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search contracts..."
                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500/30 dark:focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:text-slate-200 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-all active:scale-95 group overflow-hidden relative border border-transparent hover:border-white/20"
                    aria-label="Toggle Theme"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={theme}
                            initial={{ y: 20, opacity: 0, rotate: -45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -20, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.2, ease: "circOut" }}

                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </motion.div>
                    </AnimatePresence>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all border border-transparent hover:border-white/20 hover:shadow-sm"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 md:w-96 glass-card shadow-2xl z-20 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    {/* AI Summary Section */}
                                    {(loadingSummary || aiSummary) && unreadCount > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-100/50 dark:border-indigo-500/10">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                                    <Sparkles size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Intelligent Summary</span>
                                                        {loadingSummary && (
                                                            <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                                        )}
                                                    </div>
                                                    {loadingSummary ? (
                                                        <div className="space-y-1.5 pt-1">
                                                            <div className="h-2 w-full bg-indigo-100 dark:bg-indigo-500/20 rounded animate-pulse"></div>
                                                            <div className="h-2 w-3/4 bg-indigo-100 dark:bg-indigo-500/20 rounded animate-pulse"></div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                                            "{aiSummary}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.isRead && markAsRead(n.id)}
                                                    className={cn(
                                                        "p-4 border-b border-slate-50 dark:border-white/5 cursor-pointer transition-colors group",
                                                        !n.isRead
                                                            ? "bg-indigo-50/30 dark:bg-indigo-500/5 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10"
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                            n.priority === 'Urgent' ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" :
                                                                n.priority === 'High' ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                                        )}>
                                                            <Bell size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{n.type}</span>
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className={cn(
                                                                "text-sm leading-snug",
                                                                !n.isRead ? "text-slate-900 dark:text-slate-200 font-semibold" : "text-slate-600 dark:text-slate-400"
                                                            )}>
                                                                {n.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-600">
                                                    <Bell size={24} />
                                                </div>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                                            <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                                View all notifications
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg overflow-hidden">
                            {user?.avatar ? (
                                <img src={`http://localhost:4001${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">{user?.name}</span>
                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsProfileOpen(false)}
                                ></div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 glass-card shadow-2xl z-20 py-2 border border-white/20"
                                >
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-800/30">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{user?.role}</p>
                                    </div>
                                    <div className="p-1">
                                        <Link
                                            to="/settings?tab=profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors font-medium group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                                <User size={16} />
                                            </div>
                                            My Profile
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors font-medium group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors">
                                                <SettingsIcon size={16} />
                                            </div>
                                            Account Settings
                                        </Link>
                                    </div>
                                    <div className="p-1 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                                                <LogOut size={16} />
                                            </div>
                                            Sign out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
