import express from 'express';
import Attendance from '../models/Attendance.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = express.Router();

// Get daily count for chef
router.get('/daily-count', authMiddleware, roleMiddleware(['chef', 'admin']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count employees marked as 'office' for today
    const count = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'office'
    });

    res.json({ count, date: today });
  } catch (error) {
    console.error('Get chef count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
