import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PublicRoute;