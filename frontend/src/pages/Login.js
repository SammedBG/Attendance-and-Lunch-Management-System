import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Utensils, UserCog, UserPlus } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.get('/auth/csrf');

      if (isRegistering) {
        await api.post('/auth/register', { name, email, password });
        toast.success('Account created! Signing you in...');
      } else {
        toast.loading('Authenticating...', { id: 'login-toast' });
      }
      
      await login(email, password);
      toast.success('Welcome back!', { id: 'login-toast' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed', { id: 'login-toast' });
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-blue-700 text-white md:w-1/2 flex flex-col justify-center p-12">
        <h1 className="text-4xl font-bold mb-8">Lunch & Attendance Management</h1>
        <p className="text-xl mb-10">Streamline your daily operations with our smart management system.</p>
        
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Attendance Tracking</h3>
              <p className="text-blue-100">Mark attendance and plan your schedule with ease</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Lunch Planning</h3>
              <p className="text-blue-100">Chef receives automated count for efficient lunch preparation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Admin Dashboard</h3>
              <p className="text-blue-100">Comprehensive reports and attendance analytics</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isRegistering ? 'Sign up to get started' : 'Sign in to continue to your dashboard'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition duration-200 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  {isRegistering ? (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  ) : (
                    'Sign In'
                  )}
                </>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-700 hover:text-blue-800 font-medium"
              >
                {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;