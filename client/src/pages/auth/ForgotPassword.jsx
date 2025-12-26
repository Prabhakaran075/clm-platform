import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mail, Lock, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/api/auth/verify-otp', { email, otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Identity', icon: <Mail size={16} /> },
        { id: 2, title: 'Verify', icon: <ShieldCheck size={16} /> },
        { id: 3, title: 'Secure', icon: <Lock size={16} /> }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side - Branding (Same as Login) */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-slate-900"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                            <FileText size={28} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold font-heading">NexCLM</h1>
                    </div>

                    <h2 className="text-5xl font-bold mb-6 leading-tight">
                        Security First <br /> Password Recovery
                    </h2>
                    <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                        Follow the steps to securely verify your identity and restore access to your account.
                    </p>

                    <div className="space-y-4">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${step >= s.id
                                        ? 'bg-white/20 border-white/30 text-white'
                                        : 'bg-white/5 border-white/10 text-white/50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step >= s.id ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                    {s.icon}
                                </div>
                                <span className="font-bold">{s.title}</span>
                                {step > s.id && <CheckCircle2 size={18} className="ml-auto text-emerald-400" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-1/2 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-1/2 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 relative z-10"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Mail size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
                                    <p className="text-slate-500 mt-2">Enter your email and we'll send you an OTP to reset your password.</p>
                                </div>

                                <form onSubmit={handleSendOTP} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                                placeholder="Enter your registered email"
                                            />
                                        </div>
                                    </div>

                                    {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-70"
                                    >
                                        {isLoading ? 'Sending...' : 'Send Magic Link'}
                                        {!isLoading && <ArrowRight size={20} />}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify Identity</h2>
                                    <p className="text-slate-500 mt-2">We've sent a 6-digit code to <span className="text-indigo-600 font-bold">{email}</span></p>
                                </div>

                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">6-Digit OTP</label>
                                        <div className="relative text-center">
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full text-center tracking-[1em] text-2xl font-black py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>

                                    {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-70"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                        {!isLoading && <ShieldCheck size={20} />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full flex items-center justify-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-700"
                                    >
                                        <ArrowLeft size={16} /> Change Email
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <KeyRound size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Password</h2>
                                    <p className="text-slate-500 mt-2">Almost there! Choose a strong password to protect your account.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="password"
                                                    required
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-70"
                                    >
                                        {isLoading ? 'Resetting...' : 'Reset Password'}
                                        {!isLoading && <CheckCircle2 size={20} />}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                                    <CheckCircle2 size={56} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Success!</h2>
                                    <p className="text-slate-500 mt-4 text-lg">Your password has been reset successfully. You can now log in with your new credentials.</p>
                                </div>
                                <Link
                                    to="/login"
                                    className="block w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200"
                                >
                                    Login Now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step < 4 && (
                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
