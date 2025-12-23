import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight, FileText, Lock, X, AlertTriangle } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import StatusBadge from '../../components/common/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const Contracts = () => {
    const { showAlert } = useToast();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Deletion / Undo / Security State
    const [pendingDeletion, setPendingDeletion] = useState(null); // { id, data, timeoutId }
    const [deletionCountdown, setDeletionCountdown] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToConfirmDelete, setIdToConfirmDelete] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [verifyingPassword, setVerifyingPassword] = useState(false);


    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const { data } = await axios.get('/api/contracts');
            setContracts(data);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setContracts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setIdToConfirmDelete(id);
        setShowDeleteModal(true);
        setDeletePassword('');
    };

    const confirmDeletion = async () => {
        if (!deletePassword) {
            showAlert('Administrator password required for authorization', 'warning');
            return;
        }

        setVerifyingPassword(true);
        try {
            // Verify password on backend
            await axios.post('/api/auth/verify-password', { password: deletePassword });

            // If verified, proceed with existing delete flow
            const id = idToConfirmDelete;
            const contractToDelete = contracts.find(c => c._id === id || c.id === id);

            if (contractToDelete) {
                // Remove from local state immediately
                setContracts(prev => prev.filter(c => (c._id !== id && c.id !== id)));

                // Set up the delayed backend deletion
                const timeoutId = setTimeout(async () => {
                    try {
                        const realId = contractToDelete.id || id;
                        if (!realId) return;
                        await axios.delete(`/api/contracts/${realId}`);
                        setPendingDeletion(null);
                    } catch (error) {
                        console.error('Failed to delete contract:', error);
                        setPendingDeletion(null);
                    }
                }, 7000);

                // Set pending deletion metadata for undo
                setPendingDeletion({ id, data: contractToDelete, timeoutId });
                setDeletionCountdown(7);

                // Start visual countdown
                const intervalId = setInterval(() => {
                    setDeletionCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(intervalId);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

            setShowDeleteModal(false);
            setIdToConfirmDelete(null);
        } catch (error) {
            console.error('Verification failed:', error);
            showAlert(error.response?.data?.message || 'Invalid password. Access denied.', 'error');
        } finally {
            setVerifyingPassword(false);
        }
    };

    const undoDelete = () => {
        if (!pendingDeletion) return;

        // 1. Clear the backend deletion timer
        clearTimeout(pendingDeletion.timeoutId);

        // 2. Restore the contract to local state
        setContracts(prev => [pendingDeletion.data, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

        // 3. Reset deletion state
        setPendingDeletion(null);
        setDeletionCountdown(0);
    };

    // Filter Logic
    const filteredContracts = contracts.filter(contract => {
        const matchesSearch = (
            contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesStatus = (
            statusFilter === 'All' ||
            contract.status?.toLowerCase() === statusFilter.toLowerCase() ||
            (statusFilter === 'Review' && (
                contract.status?.toLowerCase() === 'review' ||
                contract.status?.toLowerCase() === 'under_review' ||
                contract.status?.toLowerCase() === 'under review'
            ))
        );

        return matchesSearch && matchesStatus;
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(new Date().setDate(now.getDate() + 30));

    const stats = [
        {
            label: 'Total Active',
            value: contracts.filter(c => c.status?.toLowerCase() === 'active').length,
            color: 'emerald',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600'
        },
        {
            label: 'Pending Review',
            value: contracts.filter(c => {
                const s = c.status?.toLowerCase();
                return s === 'review' || s === 'under review' || s === 'under_review' || s === 'underreview' || s === 'draft';
            }).length,
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600'
        },
        {
            label: 'Expiring Soon',
            value: contracts.filter(c => {
                if (!c.endDate) return false;
                const expiry = new Date(c.endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time for date comparison
                return expiry >= today && expiry <= thirtyDaysFromNow;
            }).length,
            color: 'amber',
            bg: 'bg-amber-50',
            text: 'text-amber-600'
        },
    ];

    const formatCurrency = (value, currency) => {
        const symbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : currency);
        return `${symbol} ${value?.toLocaleString('en-IN')}`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Contracts Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Efficiently manage and track organizational agreements</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/contracts/new" className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                        <Plus size={18} />
                        New Contract
                    </Link>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="glass-card p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full ${s.bg} dark:bg-slate-800 flex items-center justify-center ${s.text}`}>
                            <FileText size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm backdrop-blur-sm">
                <div className="relative w-full md:w-96 ml-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search contracts..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1 bg-slate-100/60 dark:bg-slate-800/50 rounded-xl mr-1">
                    {['All', 'Active', 'Draft', 'Review'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === f
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/10'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-transparent'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <button className="px-4 py-2 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-2 border-l border-slate-200 dark:border-white/10 ml-1">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Contracts List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-white/5 text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4.5">Agreement</th>
                                <th className="px-6 py-4.5">Owner / Dept</th>
                                <th className="px-6 py-4.5">Status</th>
                                <th className="px-6 py-4.5">Total Value</th>
                                <th className="px-6 py-4.5">Expiry</th>
                                <th className="px-6 py-4.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-75" />
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-150" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredContracts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                    <Search className="text-slate-400" />
                                                </div>
                                                <p className="text-slate-400">No contracts found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContracts.map((contract, index) => (
                                        <motion.tr
                                            key={contract._id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-sm">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                                            {contract.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{contract.vendor?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{contract.owner?.name || 'Admin'}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{contract.department || 'General'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={contract.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                                    {formatCurrency(contract.value?.amount, contract.value?.currency)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={`font-medium ${new Date(contract.endDate) < now ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {new Date(contract.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                        {new Date(contract.endDate) < now
                                                            ? 'Expired'
                                                            : `Ends In ${Math.ceil((new Date(contract.endDate) - now) / (1000 * 60 * 60 * 24))} Days`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <Link to={`/contracts/${contract._id}`} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 shadow-none hover:shadow-sm" title="View">
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link to={`/contracts/${contract._id}/edit`} className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 shadow-none hover:shadow-sm" title="Edit">
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(contract._id)}
                                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 shadow-none hover:shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30 text-xs text-slate-500 dark:text-slate-400">
                    <p>
                        Total {filteredContracts.length} agreements found
                    </p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-400" disabled>Previous</button>
                        <button className="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">Next</button>
                    </div>
                </div>
            </div>

            {/* Undo Deletion Toast */}
            <AnimatePresence>
                {pendingDeletion && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
                    >
                        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 flex items-center justify-center relative">
                                    <span className="text-xs font-bold text-indigo-400">{deletionCountdown}</span>
                                    <svg className="absolute inset-0 -rotate-90 w-full h-full">
                                        <circle
                                            cx="20" cy="20" r="18"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            fill="transparent"
                                            className="text-indigo-500"
                                            strokeDasharray={113.1}
                                            strokeDashoffset={113.1 * (1 - deletionCountdown / 7)}
                                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Contract deleted</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{pendingDeletion.data.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={undoDelete}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                UNDO
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Password Verification Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-white/5"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">Confirm Secure Deletion</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                    You are about to delete a contract. This action requires authorization. Please enter your account password to proceed.
                                </p>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && confirmDeletion()}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="flex-1 px-4 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-2xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeletion}
                                            disabled={verifyingPassword}
                                            className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                        >
                                            {verifyingPassword ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Verify & Delete'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Contracts;
