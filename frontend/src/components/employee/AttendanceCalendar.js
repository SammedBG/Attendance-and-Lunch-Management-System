import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isWeekend } from 'date-fns';
import { attendanceService } from '../../services/api';
import 'react-calendar/dist/Calendar.css';
import { Building2, Home, Briefcase } from 'lucide-react';

const AttendanceCalendar = ({ onDateSelect }) => {
  const [value, setValue] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);

  const toUtcDateString = (dateValue) => {
    const date = new Date(dateValue);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const month = value.getMonth();
  const year = value.getFullYear();

  useEffect(() => {
    loadMonthlyAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const loadMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const month = value.getMonth() + 1; // JavaScript months are 0-based
      const year = value.getFullYear();
      
      const response = await attendanceService.getMonthlyAttendance(month, year);
      setAttendanceData(response.data.reduce((acc, item) => {
        acc[toUtcDateString(item.date)] = {
          status: item.status
        };
        return acc;
      }, {}));
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setValue(date);
    onDateSelect(date);
  };

  // Custom tile content to show attendance status
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData[dateStr];
    
    if (!attendance) return null;
    
    return (
      <div className="mt-1">
        {attendance.status === 'office' && (
          <Building2 className="h-4 w-4 mx-auto text-blue-600" />
        )}
        {attendance.status === 'home' && (
          <Home className="h-4 w-4 mx-auto text-green-600" />
        )}
        {attendance.status === 'leave' && (
          <Briefcase className="h-4 w-4 mx-auto text-amber-600" />
        )}
      </div>
    );
  };

  // Custom className for tiles
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData[dateStr];
    
    if (!attendance) return '';
    
    const classes = [
      'rounded-md',
      'transition-colors',
      'duration-200'
    ];
    
    switch (attendance.status) {
      case 'office':
        classes.push('bg-blue-100', 'hover:bg-blue-200');
        break;
      case 'home':
        classes.push('bg-green-100', 'hover:bg-green-200');
        break;
      case 'leave':
        classes.push('bg-amber-100', 'hover:bg-amber-200');
        break;
      default:
        break;
    }
    
    return classes.join(' ');
  };

  // Disable weekend days
  const tileDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isWeekend(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">Attendance Calendar</h2>
      
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      <div className="custom-calendar-container">
        <style jsx>{`
          .custom-calendar-container .react-calendar {
            width: 100%;
            border: none;
            font-family: inherit;
          }
          .custom-calendar-container .react-calendar__tile {
            height: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .custom-calendar-container .react-calendar__month-view__weekdays {
            text-transform: uppercase;
            font-weight: bold;
          }
          .custom-calendar-container .react-calendar__tile--active {
            background: #f0f9ff;
            color: black;
          }
          .custom-calendar-container .react-calendar__tile--active:enabled:hover,
          .custom-calendar-container .react-calendar__tile--active:enabled:focus {
            background: #dbeafe;
          }
        `}</style>
        <Calendar
          onChange={handleDateChange}
          value={value}
          tileContent={tileContent}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          className="border-0"
        />
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 rounded-sm mr-2"></div>
          <span>Office</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 rounded-sm mr-2"></div>
          <span>Home</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-100 rounded-sm mr-2"></div>
          <span>Leave</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;