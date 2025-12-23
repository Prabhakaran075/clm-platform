import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Phone, Mail, Filter, Trash2, MoreVertical, Building2, ExternalLink, ShieldCheck, Lock, X, AlertTriangle } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import CreateVendorModal from '../../components/modals/CreateVendorModal';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const Vendors = () => {
  const { showAlert } = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Deletion / Security State
  const [pendingDeletion, setPendingDeletion] = useState(null); // { id, data, timeoutId }
  const [deletionCountdown, setDeletionCountdown] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToConfirmDelete, setIdToConfirmDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data } = await axios.get('/api/vendors');
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
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
      await axios.post('/api/auth/verify-password', { password: deletePassword });

      const id = idToConfirmDelete;
      const vendorToDelete = vendors.find(v => v._id === id || v.id === id);

      if (vendorToDelete) {
        setVendors(prev => prev.filter(v => (v._id !== id && v.id !== id)));

        const timeoutId = setTimeout(async () => {
          try {
            const realId = vendorToDelete.id || id;
            await axios.delete(`/api/vendors/${realId}`);
            setPendingDeletion(null);
          } catch (error) {
            console.error('Failed to delete vendor:', error);
            // Re-fetch list if backend delete fails (e.g. constraints)
            fetchVendors();
            setPendingDeletion(null);
            showAlert(error.response?.data?.message || 'Failed to delete vendor. It may have associated contracts.', 'error');
          }
        }, 7000);

        setPendingDeletion({ id, data: vendorToDelete, timeoutId });
        setDeletionCountdown(7);

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
      showAlert(error.response?.data?.message || 'Invalid password.', 'error');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const undoDelete = () => {
    if (!pendingDeletion) return;
    clearTimeout(pendingDeletion.timeoutId);
    setVendors(prev => [pendingDeletion.data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
    setPendingDeletion(null);
    setDeletionCountdown(0);
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const vendorTypes = ['All', ...new Set(vendors.map(v => v.type))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Vendors Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and monitor your strategic partner relationships</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Add New Vendor
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm backdrop-blur-sm">
        <div className="relative w-full md:w-96 ml-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search vendors by name or email..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-100/60 dark:bg-slate-800/50 rounded-xl mr-1">
          {vendorTypes.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${typeFilter === f
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

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-1/2 h-4" />
              </div>
              <div className="pt-4 flex gap-4">
                <Skeleton className="w-full h-8 rounded-lg" />
              </div>
            </div>
          ))
        ) : filteredVendors.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="text-slate-300" size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No vendors found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any vendors matching your current search or filter criteria.</p>
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter('All'); }}
              className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor._id || vendor.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group glass-card p-6 hover:border-indigo-500/30 transition-all relative hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none hover:-translate-y-1"
              >
                <div className="flex justify-between items-start ">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all border border-transparent group-hover:border-indigo-500/20 dark:group-hover:border-white/10 shadow-sm group-hover:shadow-md">
                    <Building2 size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${vendor.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                      {vendor.status || 'Active'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(vendor._id || vendor.id); }}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate" title={vendor.name}>
                    {vendor.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {vendor.type}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <Mail size={14} />
                    </div>
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <Phone size={14} />
                    </div>
                    <span>{vendor.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <MapPin size={14} />
                    </div>
                    <span className="truncate">
                      {vendor.address?.city ? `${vendor.address?.city}, ${vendor.address?.country}` : 'Location Not Set'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex gap-2">
                  <Link
                    to={`/vendors/${vendor._id || vendor.id}`}
                    className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    View Details <ExternalLink size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
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
                  <p className="text-sm font-medium">Vendor removed</p>
                  <p className="text-xs text-slate-400 truncate max-w-[180px]">{pendingDeletion.data.name}</p>
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

                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">Secure Vendor Removal</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Removing a vendor is a sensitive action. This action requires authorization. Please enter your account password to proceed.
                </p>

                <div className="space-y-4">
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="Enter administrator password"
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
                        'Confirm & Proceed'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateVendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVendorCreated={fetchVendors}
      />
    </div>
  );
};

export default Vendors;
