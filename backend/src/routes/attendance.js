import express from 'express';
import Attendance from '../models/Attendance.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  getAttendanceSchema,
  getMonthlyAttendanceSchema,
  markAttendanceSchema
} from '../validators/attendance.validator.js';
import {
  getIstNow,
  getUtcDateOnlyFromDateString,
  getUtcDayRangeForIstDate,
  getUtcDayRangeFromDateString
} from '../utils/date.js';

const router = express.Router();

// Mark attendance
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['employee', 'admin']),
  validate(markAttendanceSchema),
  async (req, res) => {
    try {
      const { status, date } = req.body;
      const userId = req.user.id;

    // Parse the incoming 'yyyy-MM-dd' string as UTC midnight
      const reqDate = getUtcDateOnlyFromDateString(date);
      if (!reqDate) {
        return res.status(400).json({ message: 'Invalid date' });
      }

    // Calculate current 'today' reliably in IST (+05:30)
      const istTime = getIstNow();
    
    // Create a UTC midnight representation representing the current IST day
      const { start: today } = getUtcDayRangeForIstDate();

      if (reqDate.getTime() === today.getTime()) {
        const currentHour = istTime.getUTCHours();
        const currentMinute = istTime.getUTCMinutes();
        
        const isPastCutoff = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
        
        if (isPastCutoff) {
          return res.status(400).json({ message: 'Past 9:30 AM cutoff time for today' });
        }
      } else if (reqDate.getTime() < today.getTime()) {
        return res.status(400).json({ message: 'Cannot mark attendance for past dates' });
      }

    // Check if an attendance record already exists for this exact date (now normalized)
      const existingRecord = await Attendance.findOne({
        userId,
        date: reqDate
      });

      if (existingRecord) {
        // Update existing record
        existingRecord.status = status;
        await existingRecord.save();
        return res.json(existingRecord);
      }

    // Create new attendance record
      const attendance = new Attendance({
        userId,
        date: reqDate,
        status
      });

      await attendance.save();
      res.status(201).json(attendance);
    } catch (error) {
      console.error('Attendance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
});

// Get attendance records
router.get('/', authMiddleware, validate(getAttendanceSchema, 'query'), async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (date) {
      // Get attendance for specific date
      const range = getUtcDayRangeFromDateString(date);
      if (!range) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      const { start, end } = range;

      const attendance = await Attendance.findOne({
        userId,
        date: { $gte: start, $lt: end }
      });
      
      return res.json(attendance || { date, status: null });
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find({ userId }).sort({ date: -1 });
    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly attendance
router.get('/monthly', authMiddleware, validate(getMonthlyAttendanceSchema, 'query'), async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const startDate = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));
    const endDate = new Date(Date.UTC(yearNumber, monthNumber, 1));

    const attendanceRecords = await Attendance.find({
      userId,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
