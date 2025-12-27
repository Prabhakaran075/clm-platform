import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set up base URL for API calls
// Set to empty string because our paths already start with /api
axios.defaults.baseURL = '';
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
                error: error.response?.data?.message || error.message || 'Login failed. Please check your connection.',
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
                if (additionalData[key] !== null && additionalData[key] !== undefined) {
                    formData.append(key, additionalData[key]);
                }
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await axios.post('/api/auth/register', formData, config);

            return { success: true, message: data.message };

        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed. Please try again.',
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
                error: error.response?.data?.message || error.message || 'Verification failed. Please try again.'
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, verifyEmail, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

