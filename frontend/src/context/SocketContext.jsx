import React, { createContext, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (user && token) {
      // Connect to Gateway (which proxies to Notification Service)
      // Socket.io client automatically connects to window.location (http://localhost:5173)
      // But we need to connect to API Gateway (http://localhost:3000)
      const newSocket = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling'], // Force websocket preferred
      });

      newSocket.on('connect', () => {
        console.log('[Socket] Connected:', newSocket.id);
      });

      newSocket.on('new_notification', (notification) => {
        console.log('[Socket] New Notification:', notification);
        
        // Display Toast
        let message = "You have a new notification";
        if (notification.type === 'POST_LIKED') message = "Someone liked your post!";
        if (notification.type === 'USER_FOLLOWED') message = "You have a new follower!";
        
        toast(message, {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        });
      });

      newSocket.on('connect_error', (err) => {
        console.error('[Socket] Connection Error:', err.message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]); // Re-connect if user changes

  return (
    <SocketContext.Provider value={{}}>
      {children}
    </SocketContext.Provider>
  );
};
