import axios from 'axios';

// Points to the Production Cloud Gateway
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
    // We do NOT redirect here to avoid hard refreshes.
    // Instead, we reject the promise and let the calling code (AuthContext) handle the logout.
    if (error.response && error.response.status === 401) {
       // Optional: Clear token here if you want to be aggressive, 
       // but better to let AuthContext handle state updates.
       localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;