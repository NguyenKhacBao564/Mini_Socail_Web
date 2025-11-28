import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://api-gateway-585107925400.asia-southeast1.run.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
       // Optional: Handle token expiration (e.g., logout user)
       localStorage.removeItem('token');
       // You might want to redirect to login here, 
       // but usually, the UI reacts to the failed state.
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
