import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="glass-card p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div className="content relative z-10">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-heading">{value}</h3>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs font-medium",
                            trend === 'up' ? "text-green-600" : "text-red-600"
                        )}>
                            <span>{trend === 'up' ? '↑' : '↓'} {trendValue}</span>
                            <span className="text-slate-400 font-normal">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={cn(
                    "p-3 rounded-xl bg-opacity-10 backdrop-blur-sm transition-transform group-hover:scale-110",
                    color // Expecting bg-indigo-500 etc. but we need to handle text/bg mapping manually or pass full class
                )}>
                    {/* We'll pass the full className string for color in the parent, or handle it here */}
                    <div className={cn("p-2 rounded-lg", color)}>
                        <Icon size={24} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Decorative background element */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500",
                color?.replace('bg-', 'bg-') // Simple hack to reuse the color class
            )}></div>
        </motion.div>
    );
};

export default StatCard;
