import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart4, 
  ClipboardList, 
  UserCog, 
  User, 
  LogOut, 
  LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AttendanceReport from '../components/admin/AttendanceReport';
import AttendanceStats from '../components/admin/AttendanceStats';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
              <span className="ml-3 font-medium">{user?.name || 'Admin'}</span>
            </div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
          
          <nav className="space-y-1">
            <Link
              to="/admin"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin' || location.pathname === '/admin/'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            
            <Link
              to="/admin/reports"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/reports'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <ClipboardList className="h-5 w-5 mr-3" />
              Attendance Reports
            </Link>
            
            <Link
              to="/admin/stats"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/stats'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <BarChart4 className="h-5 w-5 mr-3" />
              Analytics
            </Link>
            
            <Link
              to="/admin/users"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/users'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <UserCog className="h-5 w-5 mr-3" />
              User Management
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
              <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
              <div className="grid grid-cols-1 gap-6">
                <AttendanceReport />
                <AttendanceStats />
              </div>
            </>
          } />
          
          <Route path="/reports" element={
            <>
              <h1 className="text-2xl font-bold mb-6">Attendance Reports</h1>
              <AttendanceReport />
            </>
          } />
          
          <Route path="/stats" element={
            <>
              <h1 className="text-2xl font-bold mb-6">Attendance Analytics</h1>
              <AttendanceStats />
            </>
          } />
          
          <Route path="/users" element={
            <>
              <h1 className="text-2xl font-bold mb-6">User Management</h1>
              <UserManagement />
            </>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;