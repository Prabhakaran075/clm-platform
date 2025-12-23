import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

const EditVendorModal = ({ isOpen, onClose, vendor, onVendorUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'Furniture',
        status: 'Active',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                type: vendor.type || 'Furniture',
                status: vendor.status || 'Active',
                street: vendor.address?.street || '',
                city: vendor.address?.city || '',
                state: vendor.address?.state || '',
                zip: vendor.address?.zip || '',
                country: vendor.address?.country || ''
            });
        }
    }, [vendor]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                type: formData.type,
                status: formData.status,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: formData.country
                }
            };

            await axios.put(`/api/vendors/${vendor._id}`, payload);
            onVendorUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating vendor:', error);
            setError(error.response?.data?.message || 'Failed to update vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5"
            >
                <div className="border-b border-slate-100 dark:border-white/5 px-8 py-5 flex items-center justify-between bg-slate-50/50 dark:bg-white/2">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Edit Vendor Profile</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Modify vendor details and compliance info.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Vendor Name</label>
                            <input
                                name="name"
                                required
                                className="input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter company name..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="vendor@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Phone Number</label>
                            <input
                                name="phone"
                                className="input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Vendor Type</label>
                            <select
                                name="type"
                                className="input"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="Furniture">Furniture</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Services">Services</option>
                                <option value="Logistics">Logistics</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Active Status</label>
                            <select
                                name="status"
                                className="input"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>

                        <div className="col-span-2 space-y-4 pt-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2">Business Address</h4>
                            <input
                                name="street"
                                placeholder="Street Address"
                                className="input"
                                value={formData.street}
                                onChange={handleChange}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="city"
                                    placeholder="City"
                                    className="input"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                                <input
                                    name="state"
                                    placeholder="State / Province"
                                    className="input"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="zip"
                                    placeholder="Zip / Postal Code"
                                    className="input"
                                    value={formData.zip}
                                    onChange={handleChange}
                                />
                                <input
                                    name="country"
                                    placeholder="Country"
                                    className="input"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4 border-t border-slate-100 dark:border-white/5 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex items-center gap-2 px-8 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>Uploading...</>
                            ) : (
                                <><Save size={18} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditVendorModal;
