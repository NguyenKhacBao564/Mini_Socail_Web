import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Ideally, verify token validity with a backend call like /auth/me
        // For now, we assume if token exists, we are "logged in" somewhat.
        // Or decode the token if it's a JWT to get user info.
        // Let's try to get a simple user object or decode the JWT if possible.
        // Since we don't have a /me endpoint specified, we'll just set a flag or basic object.
        try {
             // Decided to just trust the token for now or check if it exists.
             // To be more robust, let's decode the payload if we can (simple base64 check).
             const payload = JSON.parse(atob(token.split('.')[1]));
             setUser({ id: payload.id, username: payload.username || 'User' });
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
      // Backend returns { success: true, data: { token, user } }
      const { token, user } = response.data.data; 
      
      localStorage.setItem('token', token);
      
      // If user info is not returned, decode token
      if (!user) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ id: payload.id, username: payload.username || email });
      } else {
          setUser(user);
      }
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
