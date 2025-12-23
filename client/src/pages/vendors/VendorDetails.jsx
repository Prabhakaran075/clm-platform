import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Mail, Phone, MapPin, Building2, Calendar,
    FileText, ExternalLink, ArrowRight, Search, Filter,
    CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';
import EditVendorModal from '../../components/modals/EditVendorModal';

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contractSearch, setContractSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchVendor = async () => {
        try {
            const { data } = await axios.get(`/api/vendors/${id}`);
            setVendor(data);
        } catch (error) {
            console.error('Error fetching vendor:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendor();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-64 h-8" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="w-full h-64 rounded-3xl" />
                        <Skeleton className="w-full h-96 rounded-3xl" />
                    </div>
                    <Skeleton className="w-full h-80 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">The vendor you are looking for does not exist or has been removed.</p>
                <Link to="/vendors" className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-2">
                    <ChevronLeft size={18} /> Back to Directory
                </Link>
            </div>
        );
    }

    const filteredContracts = (vendor.contracts || []).filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(contractSearch.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = [
        { label: 'Total Contracts', value: vendor.contracts?.length || 0, icon: FileText, color: 'indigo' },
        { label: 'Active Pipeline', value: vendor.contracts?.filter(c => c.status === 'Active').length || 0, icon: CheckCircle2, color: 'emerald' },
        { label: 'Pending Review', value: vendor.contracts?.filter(c => ['Draft', 'Under Review'].includes(c.status)).length || 0, icon: Clock, color: 'amber' },
    ];

    return (
        <div className="space-y-8">
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/vendors')}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">{vendor.name}</h1>
                            <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                vendor.status === 'Active'
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            )}>
                                {vendor.status || 'Active'}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Vendor Profile & Contract History</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        Edit Profile
                    </button>
                    <Link to="/contracts/new" className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                        + New Contract
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Stats & Contracts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className="glass-card p-5 flex items-center justify-between group hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-0.5">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{s.value}</p>
                                </div>
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                    s.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                                        s.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                            "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                )}>
                                    <s.icon size={22} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contracts Section */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                                Associated Contracts
                            </h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 w-40 dark:text-slate-300"
                                        value={contractSearch}
                                        onChange={(e) => setContractSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8 dark:text-slate-300"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Under Review">Review</option>
                                </select>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50 dark:divide-white/5">
                            {filteredContracts.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 dark:text-slate-500">
                                    <FileText size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-sm font-medium">No contracts found for this vendor.</p>
                                </div>
                            ) : (
                                filteredContracts.map((contract) => (
                                    <Link
                                        key={contract.id}
                                        to={`/contracts/${contract.id}`}
                                        className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all border border-transparent group-hover:border-indigo-500/20 dark:group-hover:border-white/10 shadow-sm group-hover:shadow-md">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {contract.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                                                        {new Date(contract.startDate).toLocaleDateString()}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider",
                                                        contract.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                                                    )}>
                                                        {contract.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Vendor Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4 mb-6 uppercase text-xs tracking-widest">Vendor Information</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 h-fit">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Company Type</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{vendor.type}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 h-fit">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{vendor.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 h-fit">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Phone Number</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{vendor.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 h-fit">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Registered Address</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-relaxed">
                                        {vendor.address?.street && `${vendor.address.street}, `}
                                        {vendor.address?.city}, {vendor.address?.state}<br />
                                        {vendor.address?.country} {vendor.address?.zipCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <h4 className="font-bold uppercase text-xs tracking-widest">Compliance Status</h4>
                        </div>
                        <p className="text-indigo-100 text-[10px] font-medium leading-relaxed mb-6">This vendor is currently verified and meets all organizational compliance requirements for Active contracts.</p>
                        <button className="w-full py-2.5 bg-white text-indigo-600 font-bold text-xs rounded-xl shadow-lg shadow-black/5 hover:bg-slate-50 transition-colors">
                            View Certificates
                        </button>
                    </div>
                </div>
            </div>

            <EditVendorModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                vendor={vendor}
                onVendorUpdated={fetchVendor}
            />
        </div>
    );
};

export default VendorDetails;
