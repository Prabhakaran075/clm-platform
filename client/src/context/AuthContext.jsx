import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set up base URL for API calls
// Relative path to support Vercel context rewrites
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post('/api/auth/login', { email, password }, config);

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
            };
        }
    };

    const register = async (name, email, password, role, additionalData = {}) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);

            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await axios.post('/api/auth/register', formData, config);

            // Don't set user yet, need verification
            return { success: true, message: data.message };

        } catch (error) {
            return {
                success: false,
                error: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('userInfo');
            setUser(null);
        }
    };

    const updateUser = (data) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        const updatedInfo = { ...userInfo, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
        setUser(updatedInfo);
    };

    const verifyEmail = async (email, otp) => {
        try {
            const { data } = await axios.post('/api/auth/verify-email', { email, otp });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed'
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, verifyEmail, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

