import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch full user data
  const fetchCurrentUser = async (userId) => {
    try {
      const res = await axiosClient.get(`/users/${userId}`);
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
             const payload = JSON.parse(atob(token.split('.')[1]));
             // Set initial basic info from token to avoid UI flicker
             setUser({ id: payload.id, username: payload.username || 'User' });
             
             // Then fetch full details (avatar, etc)
             await fetchCurrentUser(payload.id);
        } catch (e) {
            console.error("Invalid token", e);
            localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/users/login', { email, password });
      const { token, user: basicUser } = response.data.data; 
      
      localStorage.setItem('token', token);
      setUser(basicUser);
      
      // Fetch full details immediately
      await fetchCurrentUser(basicUser.id);
      
      return { success: true };
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
