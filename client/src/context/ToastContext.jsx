import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showAlert = useCallback((message, type = 'info', duration = 3000) => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, duration);
    }, []);

    const Icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertCircle,
        info: Info,
    };

    const Colors = {
        success: 'bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/20',
        error: 'bg-red-500/90 border-red-400 text-white shadow-red-500/20',
        warning: 'bg-amber-500/90 border-amber-400 text-white shadow-amber-500/20',
        info: 'bg-indigo-500/90 border-indigo-400 text-white shadow-indigo-500/20',
    };

    const Icon = toast ? Icons[toast.type] || Icons.info : null;

    return (
        <ToastContext.Provider value={{ showAlert }}>
            {children}
            <AnimatePresence>
                {toast && (
                    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className={cn(
                                "max-w-md w-full glass-panel border p-6 flex flex-col items-center text-center gap-4 shadow-2xl backdrop-blur-xl",
                                Colors[toast.type] || Colors.info
                            )}
                        >
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 animate-bounce">
                                <Icon size={40} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold capitalize tracking-tight">
                                    {toast.type === 'info' ? 'Notification' : toast.type}
                                </h4>
                                <p className="font-medium opacity-90 leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
};
