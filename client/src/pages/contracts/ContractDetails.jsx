import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, DollarSign, Building, FileText, Clock,
    CheckCircle, AlertCircle, Download, Edit, ArrowLeft, Eye
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const ContractDetails = () => {
    const { id } = useParams();
    const { showAlert } = useToast();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchContract();
    }, [id]);

    const fetchContract = async () => {
        try {
            const { data } = await axios.get(`/api/contracts/${id}`);
            setContract(data);
        } catch (error) {
            console.error('Error fetching contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        if (!window.confirm('Are you sure you want to activate this contract?')) return;

        setLoading(true);
        try {
            await axios.put(`/api/contracts/${id}`, {
                ...contract,
                status: 'Active'
            });
            await fetchContract();
            showAlert('Contract activated successfully!', 'success');
        } catch (error) {
            console.error('Error activating contract:', error);
            showAlert('Failed to activate contract.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'terms', label: 'Terms & Conditions' },
        { id: 'attachments', label: `Attachments (${(contract?.attachments || []).length})` },
        { id: 'audit', label: 'Audit Log' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!contract) return <div>Contract not found</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <Link to="/contracts" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Contracts
                </Link>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">{contract.title}</h1>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={contract.status} />
                            <span className="text-slate-400 text-sm">ID: {contract._id}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {contract.status?.toLowerCase() !== 'active' && (
                            <button
                                onClick={handleActivate}
                                className="btn bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle size={18} /> Activate Contract
                            </button>
                        )}
                        <button className="btn btn-secondary flex items-center gap-2">
                            <Download size={18} /> Export PDF
                        </button>
                        <Link to={`/contracts/${id}/edit`} className="btn btn-primary flex items-center gap-2">
                            <Edit size={18} /> Edit Contract
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Value</p>
                        <p className="font-semibold text-slate-900">
                            {contract.value.currency === 'INR' ? '₹' : (contract.value.currency === 'USD' ? '$' : contract.value.currency)} {contract.value.amount.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                        <Building size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Vendor</p>
                        <p className="font-semibold text-slate-900">{contract.vendor?.name}</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Duration</p>
                        <p className="font-semibold text-slate-900">
                            {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Renewal In</p>
                        <p className="font-semibold text-slate-900">12 Days</p>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="glass-card overflow-hidden min-h-[500px]">
                <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-4 gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <Building size={18} className="text-slate-400" /> Vendor Details
                                        </h3>
                                        <div className="bg-slate-50/50 rounded-lg p-5 border border-slate-100 space-y-3">
                                            <div className="flex justify-between py-2 border-b border-white/50">
                                                <span className="text-slate-500">Name</span>
                                                <span className="font-medium">{contract.vendor?.name}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-white/50">
                                                <span className="text-slate-500">Contact</span>
                                                <span className="font-medium text-indigo-600">{contract.vendor?.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-slate-500">Status</span>
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FileText size={18} className="text-slate-400" /> Contract Properties
                                        </h3>
                                        <div className="bg-slate-50/50 rounded-lg p-5 border border-slate-100 space-y-3">
                                            <div className="flex justify-between py-2 border-b border-white/50">
                                                <span className="text-slate-500">Department</span>
                                                <span className="font-medium">{contract.department || 'General'}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-white/50">
                                                <span className="text-slate-500">Created By</span>
                                                <span className="font-medium">{contract.owner?.name || 'Admin User'}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-slate-500">Last Updated</span>
                                                <span className="font-medium">{new Date(contract.updatedAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'terms' && (
                            <motion.div
                                key="terms"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="prose prose-slate max-w-none bg-slate-50 p-8 rounded-xl border border-slate-100">
                                    {contract.content ? (
                                        <pre className="whitespace-pre-wrap font-sans text-slate-600">{contract.content}</pre>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <FileText size={48} className="mb-4 opacity-50" />
                                            <p>No content details available for this contract.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'attachments' && (
                            <motion.div
                                key="attachments"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(contract.attachments || []).map((file, index) => (
                                        <div key={index} className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all flex flex-col gap-3 relative">
                                            <div className="flex items-start justify-between">
                                                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <a
                                                        href={`/${file.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Open in new tab"
                                                    >
                                                        <Eye size={18} />
                                                    </a>
                                                    <a
                                                        href={`/${file.path}`}
                                                        download={file.name}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Download"
                                                    >
                                                        <Download size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                            <a
                                                href={`/${file.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block hover:text-indigo-600 transition-colors"
                                            >
                                                <p className="font-semibold text-slate-900 truncate text-sm" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {(file.size / 1024).toFixed(0)} KB
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] text-slate-400 uppercase">
                                                        {file.mimetype.split('/')[1] || 'FILE'}
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    ))}
                                    {(contract.attachments || []).length === 0 && (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                <FileText size={32} className="opacity-20" />
                                            </div>
                                            <p className="text-sm">No documents attached to this contract.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'audit' && (
                            <motion.div
                                key="audit"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="space-y-4">
                                    {(contract.auditLog || contract.auditLogs || []).map((log, index) => (
                                        <div key={index} className="flex gap-4 p-4 rounded-lg bg-white border border-slate-100 hover:border-indigo-100 transition-colors">
                                            <div className="mt-1">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Clock size={16} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{log.action}</p>
                                                <p className="text-sm text-slate-500">
                                                    Performed by <span className="text-slate-700">{log.user || log.userName}</span> on {new Date(log.date || log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!contract.auditLog && !contract.auditLogs) && (
                                        <p className="text-center text-slate-500 py-8">No audit logs found.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ContractDetails;
