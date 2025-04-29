import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceTrend {
  date: string;
  office: number;
  home: number;
  leave: number;
}

const AttendanceStats: React.FC = () => {
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<'7days' | '14days' | '30days'>('7days');
  
  useEffect(() => {
    fetchTrends();
  }, [range]);
  
  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError('');
      
      const today = new Date();
      let startDate;
      
      switch (range) {
        case '14days':
          startDate = subDays(today, 13);
          break;
        case '30days':
          startDate = subDays(today, 29);
          break;
        default:
          startDate = subDays(today, 6);
      }
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(today, 'yyyy-MM-dd');
      
      const response = await adminService.getAttendanceTrends(formattedStartDate, formattedEndDate);
      
      // Convert data format for chart
      const chartData = response.data.map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        office: item.officeCount,
        home: item.homeCount,
        leave: item.leaveCount
      }));
      
      setTrends(chartData);
    } catch (error) {
      console.error('Error fetching trends:', error);
      setError('Failed to load attendance trends');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold">Attendance Trends</h2>
        
        <div className="mt-4 md:mt-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setRange('7days')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                range === '7days'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setRange('14days')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                range === '14days'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setRange('30days')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                range === '30days'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700"></div>
        </div>
      ) : error ? (
        <div className="text-center h-64 flex flex-col justify-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchTrends}
            className="mx-auto px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : trends.length > 0 ? (
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trends}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="office" name="Office" fill="#3B82F6" />
              <Bar dataKey="home" name="Home" fill="#22C55E" />
              <Bar dataKey="leave" name="Leave" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      )}
    </div>
  );
};

export default AttendanceStats;