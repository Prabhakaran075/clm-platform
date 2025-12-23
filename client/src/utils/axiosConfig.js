import axios from 'axios';

// Set base URL for development (Vite proxy handles this, but good to have)
// In production this would be the actual API URL
// Set base URL to empty to use Vite proxy (which avoids CORS issues)
axios.defaults.baseURL = '';

// Interceptor to add token to requests
axios.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axios;
