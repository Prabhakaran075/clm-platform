import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, User, Mail, Lock, Briefcase, Phone, Building, ArrowRight, ArrowLeft, Upload } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        businessName: '',
        businessCategory: '',
        role: 'Manager',
        businessDescription: ''
    });

    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setError('');
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.businessName || !formData.businessCategory) {
            setError('Please fill in all required business fields');
            return;
        }

        setIsLoading(true);

        try {
            const res = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role,
                {
                    mobile: formData.mobile,
                    businessName: formData.businessName,
                    businessCategory: formData.businessCategory,
                    businessDescription: formData.businessDescription,
                    avatar: avatarFile
                }
            );

            if (res.success) {
                navigate('/');
            } else {
                setError(res.error);
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-800/90"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                            <FileText size={28} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold font-heading">NexCLM</h1>
                    </div>

                    <h2 className="text-5xl font-bold mb-6 leading-tight">
                        Smart Contract Management for Modern Enterprise
                    </h2>
                    <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                        Streamline your entire contract lifecycle with AI-powered insights,
                        automated workflows, and bank-grade security.
                    </p>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            SOC2 Compliant
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            256-bit Encryption
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="w-full max-w-md bg-white/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm border border-white/50 relative z-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Create your account</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Step {step} of 2
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                                onSubmit={handleNext}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Full name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-0 py-2 border-b border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent transition-colors outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Email address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-0 py-2 border-b border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent transition-colors outline-none"
                                        placeholder="you@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Mobile number</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-0 py-2 border-b border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent transition-colors outline-none"
                                        placeholder="9876543210"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-0 py-2 border-b border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent transition-colors outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full btn bg-slate-500 hover:bg-slate-600 text-white flex justify-center items-center gap-2 py-3 mt-8 rounded-lg transition-colors"
                                >
                                    Next
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                                onSubmit={handleSubmit}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Business name</label>
                                    <input
                                        type="text"
                                        name="businessName"
                                        required
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        className="w-full px-0 py-2 border-b border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent transition-colors outline-none"
                                        placeholder="ABC Furniture Pvt Ltd"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Business category</label>
                                    <select
                                        name="businessCategory"
                                        required
                                        value={formData.businessCategory}
                                        onChange={handleChange}
                                        className="w-full px-2 py-2.5 bg-slate-100 rounded-md border-none focus:ring-2 focus:ring-indigo-100 text-slate-900 outline-none"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Services">Services</option>
                                        <option value="Technology">Technology</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Your role</label>
                                    <select
                                        name="role"
                                        required
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-2 py-2.5 bg-slate-100 rounded-md border-none focus:ring-2 focus:ring-indigo-100 text-slate-900 outline-none"
                                    >
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                        <option value="StoreOwner">Store Owner</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Business description</label>
                                    <textarea
                                        name="businessDescription"
                                        rows="2"
                                        value={formData.businessDescription}
                                        onChange={handleChange}
                                        className="w-full px-0 py-2 border-b border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent transition-colors outline-none resize-none"
                                        placeholder="Briefly describe your business..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Profile image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-center overflow-hidden">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] text-slate-400 leading-tight">No image</span>
                                            )}
                                        </div>
                                        <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                            {avatarPreview ? 'Change image' : 'Upload image'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setAvatarFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setAvatarPreview(reader.result);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">JPG or PNG. Max size 5MB.</p>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 btn bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-lg transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 btn bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg transition-colors"
                                    >
                                        {isLoading ? 'Creating...' : 'Create account'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-[#5236FF] hover:underline">
                            Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
