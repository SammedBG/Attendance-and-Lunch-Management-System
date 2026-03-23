import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        redirectBasedOnRole(response.data.role);
      } catch (error) {
        // Only trigger logout logic if there was an actual auth error 
        console.error('Session check failed', error);
      }
      setIsLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'employee':
        navigate('/employee');
        break;
      case 'chef':
        navigate('/chef');
        break;
      default:
        navigate('/login');
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data;

      setUser(user);
      redirectBasedOnRole(user.role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Let the component handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error UI side', error);
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};