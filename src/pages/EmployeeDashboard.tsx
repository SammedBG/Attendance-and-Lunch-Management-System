import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AttendanceForm from '../components/employee/AttendanceForm';
import AttendanceCalendar from '../components/employee/AttendanceCalendar';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleAttendanceMarked = () => {
    // Refresh attendance data (handled inside the calendar component)
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Check current route
  const isHome = location.pathname === '/employee' || location.pathname === '/employee/';
  
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
              <span className="ml-3 font-medium">{user?.name || 'Employee'}</span>
            </div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
          
          <nav className="space-y-1">
            <Link
              to="/employee"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isHome
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            
            <Link
              to="/employee/calendar"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/employee/calendar'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Calendar View
            </Link>
            
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
        <Routes>
          <Route path="/" element={
            <>
              <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceForm 
                  selectedDate={selectedDate} 
                  onAttendanceMarked={handleAttendanceMarked} 
                />
                <AttendanceCalendar onDateSelect={handleDateSelect} />
              </div>
            </>
          } />
          
          <Route path="/calendar" element={
            <>
              <h1 className="text-2xl font-bold mb-6">Calendar View</h1>
              <div className="grid grid-cols-1 gap-6">
                <AttendanceCalendar onDateSelect={handleDateSelect} />
                <AttendanceForm 
                  selectedDate={selectedDate} 
                  onAttendanceMarked={handleAttendanceMarked} 
                />
              </div>
            </>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default EmployeeDashboard;