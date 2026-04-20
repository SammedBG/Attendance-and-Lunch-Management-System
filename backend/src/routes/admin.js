import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  dateRangeSchema,
  dailyReportSchema,
  updateUserRoleSchema
} from '../validators/admin.validator.js';
import {
  getUtcDateOnlyFromDateString,
  getUtcDayRangeForIstDate,
  getUtcDayRangeFromDateString
} from '../utils/date.js';

const router = express.Router();


// Get daily report
router.get(
  '/reports/daily',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(dailyReportSchema, 'query'),
  async (req, res) => {
  try {
    const { date } = req.query;

    const range = date
      ? getUtcDayRangeFromDateString(date)
      : getUtcDayRangeForIstDate();
    if (!range) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const { start, end } = range;
    
    // Get counts for each status
    const officeCount = await Attendance.countDocuments({
      date: { $gte: start, $lt: end },
      status: 'office'
    });

    const homeCount = await Attendance.countDocuments({
      date: { $gte: start, $lt: end },
      status: 'home'
    });

    const leaveCount = await Attendance.countDocuments({
      date: { $gte: start, $lt: end },
      status: 'leave'
    });

    // Get details of employees with their status
    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lt: end }
    }).populate('userId', 'name email');

    const employees = attendanceRecords
      .filter(record => record.userId !== null)
      .map(record => ({
        id: record.userId._id,
        name: record.userId.name,
        email: record.userId.email,
        status: record.status
      }));
    
    res.json({
      date: start,
      officeCount,
      homeCount,
      leaveCount,
      employees
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance trends
router.get(
  '/reports/trends',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(dateRangeSchema, 'query'),
  async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = getUtcDateOnlyFromDateString(startDate);
    const end = getUtcDateOnlyFromDateString(endDate);
    if (!start || !end) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    const endExclusive = new Date(end);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    const trends = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: endExclusive }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "+05:30" } },
          officeCount: { $sum: { $cond: [{ $eq: ["$status", "office"] }, 1, 0] } },
          homeCount: { $sum: { $cond: [{ $eq: ["$status", "home"] }, 1, 0] } },
          leaveCount: { $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formattedTrends = trends.map(t => ({
      date: new Date(t._id),
      officeCount: t.officeCount,
      homeCount: t.homeCount,
      leaveCount: t.leaveCount
    }));

    res.json(formattedTrends);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put(
  '/users/:userId/role',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(updateUserRoleSchema),
  async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;