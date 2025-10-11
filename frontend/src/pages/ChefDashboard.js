import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, User, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chefService } from '../services/api';
import { format } from 'date-fns';

const ChefDashboard = () => {
  const { user, logout } = useAuth();
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  useEffect(() => {
    const fetchDailyCount = async () => {
      try {
        setLoading(true);
        const response = await chefService.getDailyCount();
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching daily count:', error);
        setError('Failed to load today\'s office count');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyCount();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <div className="bg-white shadow-md md:w-64 w-full md:min-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-700">LunchTrack</h1>
        </div>
        
        <div className="px-4 py-2">
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <span className="ml-3 font-medium">{user?.name || 'Chef'}</span>
            </div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">Chef Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Date and Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">{currentDate}</h2>
                  <p className="text-sm text-gray-500">Lunch planning summary</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Count Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
              </div>
            ) : error ? (
              <div className="text-center h-40 flex flex-col justify-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mx-auto px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="bg-blue-100 p-4 rounded-full mb-6">
                    <Utensils className="h-10 w-10 text-blue-700" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-semibold mb-2">Today's Lunch Count</h2>
                <div className="flex justify-center items-center">
                  <div className="bg-blue-50 rounded-full w-32 h-32 flex items-center justify-center border-4 border-blue-100 my-4">
                    <span className="text-5xl font-bold text-blue-700">{count}</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">
                  Employees working from office today
                </p>
                
                <div className="mt-8 p-4 bg-amber-50 text-amber-800 rounded-lg">
                  <p>
                    This count represents the total number of employees who have marked their attendance as "Working from Office" for today. You'll receive this notification once daily at 9:30 AM.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;