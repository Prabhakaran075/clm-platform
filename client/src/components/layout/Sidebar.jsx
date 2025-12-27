import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    let navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Contracts', href: '/contracts', icon: FileText },
        { name: 'Vendors', href: '/vendors', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    if (user?.role === 'Vendor') {
        navigation = [
            { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
        ];
    }

    const SidebarContent = () => (
        <div className="flex flex-col w-64 h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-100 dark:border-white/5 shadow-2xl md:shadow-none transition-colors duration-500">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100/50 dark:border-white/5">
                <Link
                    to={navigation[0].href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-bold text-2xl text-slate-800 dark:text-white hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <FileText size={18} />
                    </div>
                    <span className="tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400" >
                        NexCLM
                    </span>
                </Link>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Menu
                </div>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <Icon
                                size={20}
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                )}
                            />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100/50 dark:border-white/5">
                <div className="bg-indigo-50 dark:bg-indigo-500/5 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-500/10">
                    <p className="text-xs font-medium text-indigo-900 dark:text-indigo-300 mb-1">Need Help?</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400/80 mb-3">Check our docs or contact support.</p>
                    <Link
                        to="/documentation"
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold py-1.5 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center justify-center text-center"
                    >
                        Documentation
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col h-full sticky top-0">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                        />
                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 md:hidden"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
