import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FileText,
    Shield,
    Zap,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    BarChart3,
    Globe,
    Lock
} from 'lucide-react';
import LandingNavbar from '../../components/layout/LandingNavbar';

const Landing = () => {
    const features = [
        {
            title: "AI Extractions",
            description: "Automatically extract key terms, dates, and obligations from PDF contracts using advanced Gemini AI.",
            icon: <Sparkles className="text-amber-500" />,
            color: "amber"
        },
        {
            title: "Version Control",
            description: "Keep track of every change. View negotiation history and revert to previous versions at any time.",
            icon: <Zap className="text-indigo-500" />,
            color: "indigo"
        },
        {
            title: "Audit Compliance",
            description: "Full immutable logs of all contract activities. Know exactly who did what and when for maximum accountability.",
            icon: <BarChart3 className="text-emerald-500" />,
            color: "emerald"
        },
        {
            title: "Bank-Grade Security",
            description: "HttpOnly cookies and 256-bit encryption ensure your sensitive legal documents are never exposed to XSS attacks.",
            icon: <Lock className="text-rose-500" />,
            color: "rose"
        },
        {
            title: "Vendor Management",
            description: "Centralized directory for all your business relations. Track performance and compliance across your entire supply chain.",
            icon: <Globe className="text-blue-500" />,
            color: "blue"
        },
        {
            title: "Smart Notifications",
            description: "Never miss an expiration date again. Get automated alerts via email and in-app notifications for upcoming deadlines.",
            icon: <Shield className="text-purple-500" />,
            color: "purple"
        }
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen selection:bg-indigo-100 selection:text-indigo-700">
            <LandingNavbar />

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-8 shadow-sm"
                    >
                        <Sparkles size={14} />
                        Introducing AI-Powered Contract Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black font-heading text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1]"
                    >
                        Master Your Contracts <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600">
                            Without the Effort.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        The intelligent CLM platform that uses AI to organize, track, and protect your business relations. Secure, compliant, and beautifully designed.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                            Get Started Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                            Sign In
                        </Link>
                    </motion.div>

                    {/* App Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, type: 'spring', damping: 20 }}
                        className="mt-20 relative px-4"
                    >
                        <div className="relative mx-auto max-w-5xl group">
                            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] -z-10 group-hover:bg-indigo-600/30 transition-colors" />
                            <div className="rounded-3xl border border-white/20 shadow-2xl overflow-hidden glass-card">
                                <div className="h-8 bg-slate-100 dark:bg-white/5 border-b border-white/10 flex items-center px-4 gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                </div>
                                <div className="aspect-[16/9] bg-slate-900/40 backdrop-blur-3xl flex items-center justify-center">
                                    <BarChart3 size={80} className="text-indigo-500/20" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4">Core Capabilities</h2>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need for <br /> modern contract management.</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 capitalize">{feature.title}</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Security Proof */}
            <section id="security" className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-xs font-bold text-indigo-400 mb-6">
                            <Shield size={14} />
                            Security First Philosophy
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1]">Your data is guarded <br /> by the best.</h2>
                        <ul className="space-y-4 mb-10">
                            {[
                                "HttpOnly Cookie Session Management",
                                "AES-256 Data Encryption at Rest",
                                "Immutable Version Audit Trails",
                                "Role-Based Access Control (RBAC)"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-400 font-medium">
                                    <CheckCircle2 size={20} className="text-indigo-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/documentation" className="text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-2 transition-all">
                            Learn more about our security <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="aspect-square rounded-[40px] bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 flex items-center justify-center shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
                            <Shield size={160} className="text-white opacity-20 group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-4xl mx-auto p-16 rounded-[48px] bg-indigo-600 relative overflow-hidden shadow-2xl shadow-indigo-500/40">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">Ready to streamline your <br /> contract workflow?</h2>
                    <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">Join hundreds of businesses already managing their relations with NexCLM.</p>
                    <Link to="/register" className="inline-flex px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all hover:scale-105 shadow-xl">
                        Create Your Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <FileText size={18} />
                        </div>
                        <span className="text-xl font-bold dark:text-white">NexCLM</span>
                    </div>
                    <p className="text-sm text-slate-500">© 2025 NexCLM Platform. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/documentation" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Documentation</Link>
                        <a href="https://github.com" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
