import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                isScrolled
                    ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/5 py-3"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <FileText size={22} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        NexCLM
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
                    <a href="#security" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Security</a>
                    <Link to="/documentation" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Docs</Link>

                    <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                    <Link to="/login" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-slate-600 dark:text-slate-400"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 p-6 flex flex-col gap-4 shadow-xl">
                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 dark:text-slate-300">Features</a>
                    <a href="#security" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 dark:text-slate-300">Security</a>
                    <Link to="/documentation" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 dark:text-slate-300">Docs</Link>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-indigo-600">Sign In</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-center font-bold">Get Started</Link>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
