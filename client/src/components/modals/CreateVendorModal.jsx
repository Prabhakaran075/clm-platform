import { useState } from 'react';
import { X } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const CreateVendorModal = ({ isOpen, onClose, onVendorCreated }) => {
  const { showAlert } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Furniture',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country
        }
      };

      await axios.post('/api/vendors', payload);
      onVendorCreated();
      onClose();
      // Reset form roughly
      setFormData({ ...formData, name: '', email: '' });
    } catch (error) {
      console.error('Error creating vendor:', error);
      showAlert('Failed to create vendor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5"
      >
        <div className="border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Vendor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vendor Name</label>
              <input name="name" required className="input mt-1" onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input name="email" type="email" required className="input mt-1" onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <input name="phone" className="input mt-1" onChange={handleChange} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select name="type" className="input mt-1" onChange={handleChange}>
                <option value="Furniture">Furniture</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Services">Services</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <input name="street" placeholder="Street" className="input mt-1 mb-2 placeholder:text-slate-400 dark:placeholder:text-slate-600" onChange={handleChange} />
              <div className="grid grid-cols-2 gap-2">
                <input name="city" placeholder="City" className="input placeholder:text-slate-400 dark:placeholder:text-slate-600" onChange={handleChange} />
                <input name="state" placeholder="State" className="input placeholder:text-slate-400 dark:placeholder:text-slate-600" onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateVendorModal;
