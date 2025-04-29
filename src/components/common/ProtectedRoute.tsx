import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  role: 'admin' | 'employee' | 'chef';
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== role) {
    // Redirect to the appropriate dashboard based on user role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'employee') return <Navigate to="/employee" replace />;
    if (user?.role === 'chef') return <Navigate to="/chef" replace />;
    
    // Fallback to login if role is unknown
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;