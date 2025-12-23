import { motion } from 'framer-motion';
import {
    FileText, Clock, AlertTriangle, CheckCircle,
    TrendingUp, Activity, Calendar, ArrowRight, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import StatCard from '../../components/common/StatCard';

import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { useTheme } from '../../context/ThemeContext';

const Dashboard = () => {
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await axios.get('/api/dashboard');
                setData(data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Activity className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading Statistics...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, barData, pieData, lineData, recentActivity, totalContractsCount } = data;
    const COLORS = ['#94a3b8', '#fbbf24', '#34d399', '#6366f1', '#f43f5e'];

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const iconsMap = {
        'Total Contracts': FileText,
        'Portfolio Value': TrendingUp,
        'Expiring Soon': Clock,
        'Pending Approval': AlertTriangle,
    };

    const finalStats = stats.map(s => ({
        ...s,
        icon: iconsMap[s.title] || FileText
    }));

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar size={14} /> Overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Link to="/contracts/new" className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Plus size={18} /> New Contract
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {finalStats.map((stat, index) => (
                    <StatCard key={index} {...stat} delay={index * 0.1} />
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Bar Chart: Active vs Expired */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Trends</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                Active
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                Expired
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid ' + (theme === 'dark' ? '#1e293b' : '#e2e8f0'),
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                                    }}
                                    cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                                />
                                <Bar dataKey="active" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="expired" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Donut Chart: Lifecycle Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lifecycle Distribution</h3>
                    <div className="h-80 w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid ' + (theme === 'dark' ? '#1e293b' : '#e2e8f0'),
                                        color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-slate-800 dark:text-white">{totalContractsCount}</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart: Monthly Creation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6 lg:col-span-2"
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contract Creation Velocity</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineData}>
                                <defs>
                                    <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid ' + (theme === 'dark' ? '#1e293b' : '#e2e8f0'),
                                        color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                                    }}
                                />
                                <Area type="monotone" dataKey="contracts" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorContracts)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Quick Actions / Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/10"></div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{activity.message}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{formatTime(activity.time)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500 dark:text-slate-500 italic">No recent activity</p>
                            </div>
                        )}
                    </div>
                    <Link to="/settings?tab=audit" className="w-full mt-6 btn btn-secondary text-xs inline-flex items-center justify-center">
                        View Audit Logs
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
