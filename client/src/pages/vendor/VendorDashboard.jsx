import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { Skeleton } from '../../components/common/Skeleton';

const VendorDashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, expiring: 0 });

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const { data } = await axios.get('/api/contracts');
            setContracts(data);

            // Calculate stats
            const active = data.filter(c => c.status === 'Active').length;
            const expiring = data.filter(c => c.status === 'Expiring Soon').length;
            setStats({ active, expiring });
        } catch (error) {
            console.error('Error fetching contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const containerUrl = (url) => url ? url : '#';

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900">Vendor Portal</h1>
                    <p className="text-slate-500 mt-1">Manage your active contracts and agreements</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
                        <CheckCircle size={18} />
                        <span className="font-semibold">{stats.active} Active</span>
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-100">
                        <Clock size={18} />
                        <span className="font-semibold">{stats.expiring} Expiring</span>
                    </div>
                </div>
            </div>

            {/* Contracts List */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" />
                        Assigned Contracts
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Contract Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Duration</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : contracts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No contracts found assigned to your account.
                                    </td>
                                </tr>
                            ) : (
                                contracts.map((contract) => (
                                    <tr key={contract._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {contract.title}
                                            <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {contract._id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={contract.status} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                                            {contract.status === 'Expiring Soon' && (
                                                <div className="flex items-center gap-1 text-amber-600 text-xs mt-1 font-medium">
                                                    <AlertCircle size={12} /> Expires Soon
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/contracts/${contract._id}`}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <a
                                                    href={containerUrl(contract.attachmentUrl)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Download PDF"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download size={18} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
