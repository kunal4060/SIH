import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlantDoctor from './pages/PlantDoctor';
import Chatbot from './pages/Chatbot';
import PlantHistory from './pages/PlantHistory';
import Monitoring from './pages/Monitoring';
import Irrigation from './pages/Irrigation';
import Weather from './pages/Weather';
import Settings from './pages/Settings';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
        <span>Initializing RASmalAI Platform...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout bg-slate-50 min-h-screen">
      <Sidebar isOpen={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />
      <div className="main-content">
        <Navbar onToggleDrawer={() => setMobileDrawerOpen(prev => !prev)} />
        <main className="flex-1 bg-slate-50">{children}</main>
        <MobileNav onToggleDrawer={() => setMobileDrawerOpen(prev => !prev)} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/plant-doctor"
            element={
              <ProtectedLayout>
                <PlantDoctor />
              </ProtectedLayout>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedLayout>
                <Chatbot />
              </ProtectedLayout>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedLayout>
                <PlantHistory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/monitoring"
            element={
              <ProtectedLayout>
                <Monitoring />
              </ProtectedLayout>
            }
          />
          <Route
            path="/irrigation"
            element={
              <ProtectedLayout>
                <Irrigation />
              </ProtectedLayout>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedLayout>
                <Weather />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
