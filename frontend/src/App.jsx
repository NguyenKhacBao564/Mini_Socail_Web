import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './components/feed/Feed';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';
import Explore from './pages/Explore';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Wrap protected content in Layout
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="bottom-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post/:postId" 
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;