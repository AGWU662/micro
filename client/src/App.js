import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';

// Layout components
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth components
import PublicRoute from './components/auth/PublicRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import LandingPage from './pages/public/LandingPage';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import Trading from './pages/dashboard/Trading';
import Wallet from './pages/dashboard/Wallet';
import Mining from './pages/dashboard/Mining';
import P2PTrade from './pages/dashboard/P2PTrade';
import Profile from './pages/dashboard/Profile';
import KYC from './pages/dashboard/KYC';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes with PublicLayout */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* Auth routes (redirect to dashboard if logged in) */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout><Dashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/trading" element={
              <ProtectedRoute>
                <DashboardLayout><Trading /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/wallet" element={
              <ProtectedRoute>
                <DashboardLayout><Wallet /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/mining" element={
              <ProtectedRoute>
                <DashboardLayout><Mining /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/p2p" element={
              <ProtectedRoute>
                <DashboardLayout><P2PTrade /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <DashboardLayout><Profile /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/kyc" element={
              <ProtectedRoute>
                <DashboardLayout><KYC /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
