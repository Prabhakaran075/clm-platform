import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { FileText, TrendingUp, Users, Clock } from 'lucide-react';

const data = [
    { name: 'Jan', value: 400, contracts: 24, avgScore: 85 },
    { name: 'Feb', value: 300, contracts: 18, avgScore: 82 },
    { name: 'Mar', value: 600, contracts: 35, avgScore: 88 },
    { name: 'Apr', value: 800, contracts: 42, avgScore: 92 },
    { name: 'May', value: 500, contracts: 30, avgScore: 86 },
    { name: 'Jun', value: 700, contracts: 38, avgScore: 89 },
    { name: 'Jul', value: 900, contracts: 45, avgScore: 94 },
];

const categoryData = [
    { name: 'Active', value: 45, color: '#6366f1' },
    { name: 'Draft', value: 25, color: '#f59e0b' },
    { name: 'Expired', value: 15, color: '#ef4444' },
    { name: 'Pending', value: 15, color: '#10b981' },
];

const LandingChart = () => {
    return (
        <div className="w-full h-full p-8 text-slate-300 grid grid-cols-12 gap-6 bg-[#0f172a] overflow-hidden">
            {/* Top Stats */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
                {[
                    { label: 'Total Value', value: '₹2.4Cr', icon: <TrendingUp size={16} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Active Contracts', value: '1,284', icon: <FileText size={16} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Key Vendors', value: '84', icon: <Users size={16} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Renewal Rate', value: '94%', icon: <Clock size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-2 transition-all hover:bg-[#1e293b]">
                        <div className={`flex items-center gap-2 text-[10px] font-bold ${stat.color} opacity-90 uppercase tracking-[0.1em]`}>
                            <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            {stat.label}
                        </div>
                        <div className="text-2xl font-black text-white font-heading tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Chart Area */}
            <div className="col-span-12 lg:col-span-8 bg-[#1e293b]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h4 className="text-white text-lg font-black tracking-tight">Contract Performance</h4>
                        <p className="text-xs text-slate-500 font-medium">Monthly value growth and volume</p>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Live Value (INR)</span>
                    </div>
                </div>
                <div className="h-[280px] w-full mt-4 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#ffffff10',
                                    borderRadius: '16px',
                                    color: '#fff',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Side Stats/Bar Chart */}
            <div className="col-span-12 lg:col-span-4 bg-[#1e293b]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -ml-24 -mb-24" />
                <h4 className="text-white text-lg font-black tracking-tight mb-8 relative z-10">Status Breakdown</h4>
                <div className="h-[200px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ left: -10 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                width={70}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-auto space-y-4 relative z-10">
                    {categoryData.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: cat.color }} />
                                <span className="text-slate-400 text-sm font-semibold group-hover/item:text-white transition-colors capitalize">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                                </div>
                                <span className="text-white text-sm font-black tabular-nums">{cat.value}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingChart;
