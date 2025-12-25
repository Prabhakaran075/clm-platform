import React from 'react';
import { motion } from 'framer-motion';
import {
    Book,
    Zap,
    Shield,
    Users,
    FileText,
    Sparkles,
    ArrowRight,
    Search,
    LifeBuoy,
    Globe
} from 'lucide-react';

const Documentation = () => {
    const sections = [
        {
            title: "Getting Started",
            icon: <Book className="text-indigo-600" />,
            description: "NexCLM is a premium Contract Lifecycle Management platform designed for modern businesses. Effortlessly manage, track, and analyze your business relations.",
            links: [
                "User Onboarding",
                "Dashboard Overview",
                "Setting up your Profile"
            ]
        },
        {
            title: "Contract Management",
            icon: <FileText className="text-emerald-600" />,
            description: "From creation to expiration, NexCLM provides powerful tools to manage every stage of your contracts with version control and audit logs.",
            links: [
                "Creating a New Contract",
                "Version Tracking",
                "Electronic Signatures",
                "Audit Logs & Compliance"
            ]
        },
        {
            title: "AI Power Features",
            icon: <Sparkles className="text-amber-600" />,
            description: "Leverage cutting-edge AI to automate tedious tasks. NexCLM uses industrial-grade LLMs to extract data and summarize complex legal documents.",
            links: [
                "AI PDF Data Extraction",
                "Smart Alerts & Reminders",
                "Automated Summaries"
            ]
        },
        {
            title: "Vendor Relations",
            icon: <Users className="text-blue-600" />,
            description: "Maintain a comprehensive directory of your partners. Track vendor performance, compliance, and active contract histories in one place.",
            links: [
                "Vendor Directory Guide",
                "Adding New Partners",
                "Collaboration Tools"
            ]
        },
        {
            title: "Security & Access",
            icon: <Shield className="text-purple-600" />,
            description: "NexCLM uses enterprise-grade security including HttpOnly encryption and role-based access control to protect your sensitive data.",
            links: [
                "Data Isolation Explained",
                "Role-Based Access (RBAC)",
                "Password Verification Flow"
            ]
        },
        {
            title: "Support & Community",
            icon: <LifeBuoy className="text-rose-600" />,
            description: "Need help beyond the docs? Our support team and community resources are available to ensure your business never stops moving.",
            links: [
                "Submit a Support Ticket",
                "Community Forums",
                "Feature Requests"
            ]
        }
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative mb-12 py-16 px-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />

                <div className="relative max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
                            NexCLM Help Center
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight"
                    >
                        Knowledge is power. <br /> Explore the <span className="text-indigo-200">User Guide.</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-xl group"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search documentation, features, or guides..."
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Documentation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="glass-card p-8 group hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {React.cloneElement(section.icon, { size: 24 })}
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                            {section.title}
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            {section.description}
                        </p>

                        <div className="space-y-3">
                            {section.links.map(link => (
                                <div key={link} className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 group-hover:bg-indigo-500 transition-colors" />
                                    {link}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Help Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Still need help?</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Our customer success team is online 24/7 to help you.</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary px-8">Chat with Support</button>
                    <button className="btn btn-primary px-8">Upgrade to Enterprise</button>
                </div>
            </motion.div>
        </div>
    );
};

export default Documentation;
