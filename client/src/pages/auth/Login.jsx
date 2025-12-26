import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FileText, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const res = await login(email, password);
        setIsLoading(false);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-800/90"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                            <FileText size={28} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold font-heading">NexCLM</h1>
                    </div>

                    <h2 className="text-5xl font-bold mb-6 leading-tight">
                        Smart Contract Management for Modern Enterprise
                    </h2>
                    <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                        Streamline your entire contract lifecycle with AI-powered insights,
                        automated workflows, and bank-grade security.
                    </p>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            SOC2 Compliant
                        </div>
                        {/* <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            256-bit Encryption
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-1/2 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-1/2 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8 bg-white/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm border border-white/50 relative z-10"
                >
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-heading">Welcome Back</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Please enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input pl-10"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input pl-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary flex justify-center items-center gap-2 py-2.5 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>

                        {/* <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
                            </div>
                        </div> */}

                        {/* <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="btn btn-secondary flex justify-center items-center gap-2 py-2 text-sm font-medium">
                                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-4.6667-3.7833-8.45-8.45-8.45-4.6667 0-8.45 3.7833-8.45 8.45 0 4.6667 3.7833 8.45 8.45 8.45Z" fill="#fff" />
                                    <path d="M20.45 12c0-4.6667-3.7833-8.45-8.45-8.45-4.6667 0-8.45 3.7833-8.45 8.45 0 .7333.0917 1.45.2583 2.1333H12v3.2 h4.8167c-.2083 1.1-.8167 2.0333-1.7417 2.6583l2.8083 2.175c1.6417-1.5167 2.5667-3.75 2.5667-6.2166Z" fill="#4285F4" />
                                    <path d="M12 20.45c2.2917 0 4.2167-.7583 5.625-2.0583l-2.8083-2.175c-.7583.5083-1.725.8083-2.8167.8083-2.2 0-4.0667-1.4833-4.7333-3.475H4.3583v2.1917C5.7833 18.5917 8.7167 20.45 12 20.45Z" fill="#34A853" />
                                    <path d="M7.2667 13.55c-.175-.525-.2667-1.0833-.2667-1.65s.0917-1.125.2667-1.65V8.0583H4.3583C3.775 9.225 3.45 10.5583 3.45 12c0 1.4417.325 2.775.9083 3.9417l2.9084-2.3917Z" fill="#FBBC05" />
                                    <path d="M12 6.8833c1.25 0 2.375.4333 3.2583 1.275l2.4417-2.4417C16.2083 4.3583 14.2917 3.55 12 3.55 8.7167 3.55 5.7833 5.4083 4.3583 8.0583l2.9083 2.1917C7.9333 8.3667 9.8 6.8833 12 6.8833Z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button type="button" className="btn btn-secondary flex justify-center items-center gap-2 py-2 text-sm font-medium">
                                SSO
                            </button>
                        </div> */}
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
