import express from 'express';
import Attendance from '../models/Attendance.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { getUtcDayRangeForIstDate } from '../utils/date.js';

const router = express.Router();

// Get daily count for chef
router.get('/daily-count', authMiddleware, roleMiddleware(['chef', 'admin']), async (req, res) => {
  try {
    const { start, end } = getUtcDayRangeForIstDate();

    // Count employees marked as 'office' for today
    const count = await Attendance.countDocuments({
      date: { $gte: start, $lt: end },
      status: 'office'
    });

    res.json({ count, date: start });
  } catch (error) {
    console.error('Get chef count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
