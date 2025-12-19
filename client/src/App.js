import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import About from './pages/public/About';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Trading from './pages/dashboard/Trading';
import Mining from './pages/dashboard/Mining';
import Wallet from './pages/dashboard/Wallet';
import P2PTrade from './pages/dashboard/P2PTrade';
import Profile from './pages/dashboard/Profile';
import KYC from './pages/dashboard/KYC';

// Layout Components
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes with Public Layout */}
            <Route path="/" element={
              <PublicRoute>
                <PublicLayout>
                  <LandingPage />
                </PublicLayout>
              </PublicRoute>
            } />
            
            <Route path="/about" element={
              <PublicRoute>
                <PublicLayout>
                  <About />
                </PublicLayout>
              </PublicRoute>
            } />
            
            <Route path="/features" element={
              <PublicRoute>
                <PublicLayout>
                  <Features />
                </PublicLayout>
              </PublicRoute>
            } />
            
            <Route path="/pricing" element={
              <PublicRoute>
                <PublicLayout>
                  <Pricing />
                </PublicLayout>
              </PublicRoute>
            } />
            
            <Route path="/contact" element={
              <PublicRoute>
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              </PublicRoute>
            } />
            
            {/* Auth Routes - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard Routes with Dashboard Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/trading" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Trading />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/mining" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Mining />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/wallet" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Wallet />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/p2p" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <P2PTrade />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/kyc" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <KYC />
                </DashboardLayout>
              </ProtectedRoute>
            } />
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
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
