import React, { useState, useEffect } from 'react';
import { Building2, Home, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceService } from '../../services/api';
import toast from 'react-hot-toast';

const AttendanceForm = ({ selectedDate, onAttendanceMarked }) => {
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  
  const formatUtcDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const now = new Date();
  const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const istToday = formatUtcDate(istNow);
  const isToday = formattedDate === istToday;

  // Check if current time is after 9:30 AM IST
  const currentHour = istNow.getUTCHours();
  const currentMinute = istNow.getUTCMinutes();
  const isPastCutoff = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
  const isPastDate = new Date(`${formattedDate}T00:00:00.000Z`) < new Date(`${istToday}T00:00:00.000Z`);
  
  // Update form state based on IST cutoff and past dates
  useEffect(() => {
    if (isPastDate) {
      setIsDisabled(true);
      setError("Cannot mark attendance for past dates.");
    } else if (isToday && isPastCutoff) {
      setIsDisabled(false);
      setError("Notice: Cutoff has passed. Attendance marked now applies to tomorrow.");
    } else {
      setIsDisabled(false);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isToday, isPastCutoff]);
  
  // Fetch current attendance for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await attendanceService.getAttendance(formattedDate);
        if (response.data && response.data.status) {
          setStatus(response.data.status);
        } else {
          setStatus(null);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };
    
    fetchAttendance();
  }, [formattedDate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      setError('Please select an attendance status');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // If today and past cutoff, set date to tomorrow
      let targetDate = formattedDate;
      if (isToday && isPastCutoff) {
        const istTomorrow = new Date(istNow);
        istTomorrow.setUTCDate(istTomorrow.getUTCDate() + 1);
        targetDate = formatUtcDate(istTomorrow);
      }
      
      await attendanceService.markAttendance(status, targetDate);
      toast.success(`Attendance securely marked for ${isToday && isPastCutoff ? 'tomorrow' : 'today'}`);
      
      onAttendanceMarked();
    } catch (error) {
      toast.error('Network failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isToday ? 'Mark Today\'s Attendance' : `Set Attendance for ${format(selectedDate, 'MMM dd, yyyy')}`}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setStatus('office')}
            disabled={isDisabled}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              status === 'office'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Building2 className={`h-8 w-8 ${status === 'office' ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`mt-2 font-medium ${status === 'office' ? 'text-blue-600' : 'text-gray-800'}`}>
              Working from Office
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => setStatus('home')}
            disabled={isDisabled}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              status === 'home'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Home className={`h-8 w-8 ${status === 'home' ? 'text-green-600' : 'text-gray-600'}`} />
            <span className={`mt-2 font-medium ${status === 'home' ? 'text-green-600' : 'text-gray-800'}`}>
              Working from Home
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => setStatus('leave')}
            disabled={isDisabled}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              status === 'leave'
                ? 'border-amber-600 bg-amber-50'
                : 'border-gray-200 hover:border-amber-300'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Briefcase className={`h-8 w-8 ${status === 'leave' ? 'text-amber-600' : 'text-gray-600'}`} />
            <span className={`mt-2 font-medium ${status === 'leave' ? 'text-amber-600' : 'text-gray-800'}`}>
              On Leave
            </span>
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isDisabled || isSubmitting || !status}
            className={`px-6 py-2 rounded-lg font-medium ${
              isDisabled || isSubmitting || !status
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            } transition-colors`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              'Submit Attendance'
            )}
          </button>
        </div>
      </form>
      
      {isToday && !isPastCutoff && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-start">
          <div className="flex-shrink-0 mr-3 mt-1">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm">
            Please mark your attendance before 9:30 AM. After the cutoff time, your selection will be applied to the next working day.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;