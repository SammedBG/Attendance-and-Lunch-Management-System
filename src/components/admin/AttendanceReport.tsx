import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { format } from 'date-fns';
import { Building2, Home, Briefcase, Calendar } from 'lucide-react';

interface DailyReport {
  date: string;
  officeCount: number;
  homeCount: number;
  leaveCount: number;
  employees: {
    id: string;
    name: string;
    email: string;
    status: 'office' | 'home' | 'leave';
  }[];
}

const AttendanceReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchReport();
  }, [selectedDate]);
  
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await adminService.getDailyReport(formattedDate);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold">Daily Attendance Report</h2>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="relative">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchReport}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-blue-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Office</p>
                <p className="text-xl font-semibold">{report.officeCount}</p>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 flex items-center">
              <div className="bg-green-100 p-2 rounded-full">
                <Home className="h-5 w-5 text-green-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Home</p>
                <p className="text-xl font-semibold">{report.homeCount}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 flex items-center">
              <div className="bg-amber-100 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-amber-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Leave</p>
                <p className="text-xl font-semibold">{report.leaveCount}</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.employees.length > 0 ? (
                  report.employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.status === 'office' && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Office
                          </span>
                        )}
                        {employee.status === 'home' && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Home
                          </span>
                        )}
                        {employee.status === 'leave' && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            Leave
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No attendance records for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center p-6 text-gray-500">
          Select a date to view the report
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;