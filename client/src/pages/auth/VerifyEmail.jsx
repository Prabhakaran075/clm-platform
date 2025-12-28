import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { verifyLink } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Please wait while we verify your email address...');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await verifyLink(token);
                setStatus('success');
                setMessage(res.message || 'Email verified successfully!');

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
            >
                <div className="mb-6 flex justify-center">
                    {status === 'verifying' && (
                        <div className="bg-indigo-100 p-4 rounded-full">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="bg-emerald-100 p-4 rounded-full">
                            <CheckCircle className="w-12 h-12 text-emerald-600" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-red-100 p-4 rounded-full">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                    {status === 'verifying' && 'Verifying Email'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                <p className="text-slate-600 mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'success' && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">Redirecting you to dashboard...</p>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors gap-2"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Back to Login
                        </Link>
                        <p className="text-sm text-slate-500">
                            Need help? <a href="mailto:support@nexgennextopia.com" className="text-indigo-600 hover:underline">Contact Support</a>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
