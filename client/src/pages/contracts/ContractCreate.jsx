import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Save, FileText, Calendar, DollarSign, Layout, Sparkles, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ContractCreate = () => {
    const navigate = useNavigate();
    const { showAlert } = useToast();
    const [step, setStep] = useState(1);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        vendor: '',
        startDate: '',
        endDate: '',
        amount: '',
        currency: 'INR',
        department: 'IT',
        content: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const { data } = await axios.get('/api/vendors');
            setVendors(data);
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.title || !formData.vendor) {
                showAlert('Please fill in both the Title and select a Vendor.', 'warning');
                return false;
            }
        }
        if (step === 2) {
            if (!formData.startDate || !formData.endDate || !formData.amount) {
                showAlert('Please fill in all dates and the contract amount.', 'warning');
                return false;
            }
        }
        if (step === 3) {
            if (!formData.content.trim() && selectedFiles.length === 0) {
                showAlert('Please provide either a contract Scope & Terms or upload at least one document.', 'warning');
                return false;
            }
        }
        return true;
    }

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };
    const prevStep = (e) => {
        if (e) e.stopPropagation();
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        setExtracting(true);
        try {
            const { data } = await axios.post('/api/contracts/extract', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                startDate: data.startDate || prev.startDate,
                endDate: data.endDate || prev.endDate,
                amount: data.amount || prev.amount,
                currency: data.currency || prev.currency,
                department: data.department || prev.department,
                content: data.content || prev.content
            }));

            // If vendor was identified, try to find ID
            if (data.vendor) {
                const matchedVendor = vendors.find(v =>
                    v.name.toLowerCase().includes(data.vendor.toLowerCase()) ||
                    data.vendor.toLowerCase().includes(v.name.toLowerCase())
                );
                if (matchedVendor) {
                    setFormData(prev => ({ ...prev, vendor: matchedVendor._id }));
                }
            }

            showAlert("AI successfully extracted data from the PDF!", "success");
        } catch (error) {
            console.error("Extraction failed", error);
            showAlert("AI extraction failed. Please fill manually.", "error");
        } finally {
            setExtracting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ONLY submit if we are on the final step (3)
        if (step !== 3) {
            nextStep();
            return;
        }

        // Final validation for Step 3
        if (!validateStep()) {
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('vendor', formData.vendor);
            fd.append('startDate', formData.startDate);
            fd.append('endDate', formData.endDate);
            fd.append('department', formData.department);
            fd.append('amount', formData.amount);
            fd.append('currency', formData.currency);
            fd.append('content', formData.content);

            selectedFiles.forEach(file => {
                fd.append('attachments', file);
            });

            await axios.post('/api/contracts', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/contracts');
        } catch (error) {
            console.error('Error creating contract:', error);
            showAlert('Failed to create contract. Make sure all fields are valid.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        // Prevent submission on Enter unless we are in the Content step or on specific buttons
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (step < 3) {
                nextStep();
            }
        }
    };

    const steps = [
        { id: 1, name: 'Basic Info', icon: Layout },
        { id: 2, name: 'Terms & Value', icon: DollarSign },
        { id: 3, name: 'Content', icon: FileText },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Create New Contract</h1>
                <p className="text-slate-500 dark:text-slate-400">Follow the steps to draft a new agreement</p>
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

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
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
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Contract Essentials</h3>
                                    <div>
                                        <input
                                            type="file"
                                            id="pdf-upload"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer transition-all ${extracting
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                                }`}
                                        >
                                            {extracting ? (
                                                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles size={14} className="text-indigo-600" />
                                            )}
                                            {extracting ? 'Extracting...' : 'Auto-fill with AI'}
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Contract Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            className="input"
                                            placeholder="e.g. Master Services Agreement 2024"
                                            value={formData.title}
                                            onChange={handleChange}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2 flex justify-between">
                                            <span>Vendor</span>
                                            {vendors.length === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/vendors')}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                                >
                                                    + Create New Vendor
                                                </button>
                                            )}
                                        </label>
                                        <select
                                            name="vendor"
                                            required
                                            className={`input ${vendors.length === 0 ? 'bg-slate-50 border-orange-200' : ''}`}
                                            value={formData.vendor}
                                            onChange={handleChange}
                                        >
                                            <option value="">{vendors.length === 0 ? 'No vendors available - create one first!' : 'Select Vendor...'}</option>
                                            {vendors.map(v => (
                                                <option key={v.id || v._id} value={v.id || v._id}>{v.name}</option>
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
                                                placeholder="0.00"
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
                                    <p className="text-xs text-slate-400 mt-2 text-right">Markdown supported</p>
                                </div>

                                <div className="mt-8 p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group cursor-pointer relative">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:shadow-xl dark:group-hover:shadow-indigo-500/10 transition-all">
                                            <Upload size={32} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload Contract Documents</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Attach PDFs, scanned images, or signed copies (Max 10 files)</p>

                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="attachments-upload"
                                        />
                                        <label
                                            htmlFor="attachments-upload"
                                            className="btn btn-secondary py-2 px-4 cursor-pointer text-xs"
                                        >
                                            Choose Files
                                        </label>

                                        {selectedFiles.length > 0 && (
                                            <div className="mt-6 w-full space-y-3 text-left">
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Selected Files ({selectedFiles.length})</p>
                                                <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                                                    {selectedFiles.map((file, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 text-xs group/file hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/file:text-indigo-500 transition-colors">
                                                                    <FileText size={16} />
                                                                </div>
                                                                <span className="truncate font-bold text-slate-700 dark:text-slate-300">{file.name}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{(file.size / 1024).toFixed(0)} KB</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={step === 1 ? () => navigate('/contracts') : (e) => prevStep(e)}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextStep();
                            }}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                            {loading ? (
                                <>Saving...</>
                            ) : (
                                <><Save size={18} /> Create Contract</>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ContractCreate;
