import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // We do NOT force reload. The router will handle redirecting to /login if needed.
  };

  // Helper to fetch full user data
  const fetchCurrentUser = async (userId) => {
    try {
      const res = await axiosClient.get(`/users/${userId}`);
      if (res.data && res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
      // If User Not Found (404) or Unauthorized (401), logout gracefully
      if (error.response && (error.response.status === 401 || error.response.status === 404)) {
         toast.error("Session expired or user not found.");
         logout();
      }
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
             const payload = JSON.parse(atob(token.split('.')[1]));
             
             // Check if token is expired (simple check)
             const currentTime = Date.now() / 1000;
             if (payload.exp && payload.exp < currentTime) {
               throw new Error("Token expired");
             }

             // Set initial basic info from token
             setUser({ id: payload.id, username: payload.username || 'User' });
             
             // Then fetch full details
             await fetchCurrentUser(payload.id);
        } catch (e) {
            console.error("Invalid token or session", e);
            logout();
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/users/login', { email, password });
      
      if (response.data && response.data.success) {
        const { token, user: basicUser } = response.data.data; 
        
        localStorage.setItem('token', token);
        setUser(basicUser);
        
        // Fetch full details immediately
        await fetchCurrentUser(basicUser.id);
        
        return { success: true };
      } else {
        return { success: false, error: 'Login failed: Invalid response format' };
      }
    } catch (error) {
      console.error("Login error", error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, password, email) => {
    try {
      await axiosClient.post('/users/register', { username, password, email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
