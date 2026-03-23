import express from 'express';
import Attendance from '../models/Attendance.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = express.Router();

// Mark attendance
router.post('/', authMiddleware, roleMiddleware(['employee', 'admin']), async (req, res) => {
  try {
    const { status, date } = req.body;
    const userId = req.user.id;

    const reqDate = new Date(date);
    reqDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (reqDate.getTime() === today.getTime()) {
      const now = new Date();
      // Using UTC for consistent cutoff times or local depending on server
      // Converting to IST or keeping server time (which is common)
      // Since frontend checks local time (getHours), we'll perform a basic check on server's time
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (date) {
      // Get attendance for specific date
      const startDate = new Date(date);
      const endDate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));

      const attendance = await Attendance.findOne({
        userId,
        date: { $gte: startDate, $lt: endDate }
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
router.get('/monthly', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
