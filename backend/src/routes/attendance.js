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

    // Check if an attendance record already exists for this date
    const existingRecord = await Attendance.findOne({
      userId,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) }
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
      date: new Date(date),
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
