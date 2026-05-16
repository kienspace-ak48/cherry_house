import axios from 'axios';
const VITE_ENV = import.meta.env.VITE_ENV;

const axiosClient = axios.create({
    baseURL: VITE_ENV === 'development'? import.meta.env.VITE_API_URL : '/api',
    headers: {
        "Content-Type": "application/json",
    }
});

export default axiosClient;