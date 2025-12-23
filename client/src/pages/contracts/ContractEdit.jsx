import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Save, FileText, Calendar, DollarSign, Layout, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ContractEdit = () => {
    const navigate = useNavigate();
    const { showAlert } = useToast();
    const { id } = useParams();
    const [step, setStep] = useState(1);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        vendor: '',
        startDate: '',
        endDate: '',
        amount: '',
        currency: 'INR',
        department: 'IT',
        content: '',
        status: 'Draft'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
                const [vendorRes, contractRes] = await Promise.all([
                    axios.get('/api/vendors'),
                    axios.get(`/api/contracts/${id}`)
                ]);

                setVendors(vendorRes.data);

                const contract = contractRes.data;
                setFormData({
                    title: contract.title,
                    vendor: contract.vendor._id,
                    startDate: contract.startDate.split('T')[0],
                    endDate: contract.endDate.split('T')[0],
                    amount: contract.value.amount,
                    currency: contract.value.currency,
                    department: contract.department,
                    content: contract.content,
                    status: contract.status
                });
            } catch (error) {
                console.error("Failed to fetch data", error);
                showAlert("Error loading contract details", "error");
                navigate('/contracts');
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // This will trigger versioning on the backend
            const response = await axios.put(`/api/contracts/${id}`, {
                title: formData.title,
                startDate: formData.startDate,
                endDate: formData.endDate,
                department: formData.department,
                value: {
                    amount: Number(formData.amount),
                    currency: formData.currency
                },
                content: formData.content,
                status: formData.status
            });
            navigate(`/contracts/${response.data._id}`); // Go back to details of the NEW version
        } catch (error) {
            console.error('Error updating contract:', error);
            showAlert('Failed to update contract.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, name: 'Basic Info', icon: Layout },
        { id: 2, name: 'Terms & Value', icon: DollarSign },
        { id: 3, name: 'Content', icon: FileText },
    ];

    if (fetching) {
        return <div className="p-10 text-center">Loading contract details...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Edit Contract</h1>
                    <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/30 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        Creating New Version
                    </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Updating this contract will create a new version history for historical tracking.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between relative px-10">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-300 -z-10 rounded-full"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((s) => {
                    const isActive = step >= s.id;
                    const isCurrent = step === s.id;
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-transparent px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-400 dark:text-slate-600'
                                    }`}
                            >
                                {isActive && !isCurrent ? <Check size={18} /> : <s.icon size={18} />}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
                                {s.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="glass-card p-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">Contract Essentials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Contract Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            className="input"
                                            value={formData.title}
                                            onChange={handleChange}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Vendor (Locked)</label>
                                        <select
                                            name="vendor"
                                            disabled
                                            className="input bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                                            value={formData.vendor}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Vendor...</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Department</label>
                                        <select
                                            name="department"
                                            className="input"
                                            value={formData.department}
                                            onChange={handleChange}
                                        >
                                            <option value="IT">IT</option>
                                            <option value="HR">HR</option>
                                            <option value="Legal">Legal</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Finance">Finance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Status</label>
                                        <select
                                            name="status"
                                            className="input"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Active">Active</option>
                                            <option value="Under_Review">Review</option>
                                            <option value="Expired">Expired</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">Terms & Financials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            required
                                            className="input"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            required
                                            className="input"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Contract Value</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                name="amount"
                                                required
                                                className="input pl-8"
                                                value={formData.amount}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Currency</label>
                                        <select
                                            name="currency"
                                            className="input"
                                            value={formData.currency}
                                            onChange={handleChange}
                                        >
                                            <option value="INR">INR - Indian Rupee (₹)</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">Contract Content</h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Scope & Terms</label>
                                    <textarea
                                        name="content"
                                        rows="12"
                                        className="input font-mono text-sm leading-relaxed"
                                        placeholder="Enter full contract terms, scope of work, and deliverables..."
                                        value={formData.content}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={step === 1 ? () => navigate(`/contracts/${id}`) : prevStep}
                        className="btn btn-secondary flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
                    </button>

                    {step < 3 ? (
                        <button type="button" onClick={nextStep} className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                            {loading ? (
                                <>Saving Version...</>
                            ) : (
                                <><Save size={18} /> Update & Save New Version</>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ContractEdit;
