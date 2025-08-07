import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

// Import page components
import HostDashboard from './HostDashboard';
import CreateSession from './CreateSession';
import JoinSession from './JoinSession';
import WaitingRoom from './WaitingRoom';
// Import other existing components
// import LandingPage from './LandingPage';
// import AuthPage from './AuthPage';
// import GameplayPage from './GameplayPage';
// import PostGameReport from './PostGameReport';

// Protected Route wrapper for authenticated routes
const ProtectedRoute = ({ children, requireHost = false }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If requireHost is true, check if user has host role
  // This would require checking user claims or Firestore user document
  // For now, we'll assume all authenticated users can be hosts

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<div>Auth Page Placeholder</div>} />
        <Route path="/join" element={<JoinSession />} />
        
        {/* Protected Host Routes */}
        <Route 
          path="/host/dashboard" 
          element={
            <ProtectedRoute requireHost>
              <HostDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/host/create" 
          element={
            <ProtectedRoute requireHost>
              <CreateSession />
            </ProtectedRoute>
          } 
        />
        
        {/* Session Routes (can be accessed by both hosts and players) */}
        <Route path="/session/:id/waiting" element={<WaitingRoom />} />
        <Route path="/session/:id/play" element={<div>Gameplay Page Placeholder</div>} />
        <Route path="/session/:id/report" element={<div>Report Page Placeholder</div>} />
        
        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
              <p className="text-gray-400 mb-8">Page not found</p>
              <a href="/" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                Return to Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

// Example App.js integration:
/*
import React from 'react';
import AppRoutes from './AppRoutes';
import './App.css'; // Your global styles

function App() {
  return <AppRoutes />;
}

export default App;
*/