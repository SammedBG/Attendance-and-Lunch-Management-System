import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = express.Router();

// Get daily report
router.get('/reports/daily', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { date } = req.query;

    let targetDate;
    if (date) {
      targetDate = new Date(date);
    } else {
      targetDate = new Date();
    }

    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get counts for each status
    const officeCount = await Attendance.countDocuments({
      date: { $gte: targetDate, $lt: nextDay },
      status: 'office'
    });

    const homeCount = await Attendance.countDocuments({
      date: { $gte: targetDate, $lt: nextDay },
      status: 'home'
    });

    const leaveCount = await Attendance.countDocuments({
      date: { $gte: targetDate, $lt: nextDay },
      status: 'leave'
    });

    // Get details of employees with their status
    const attendanceRecords = await Attendance.find({
      date: { $gte: targetDate, $lt: nextDay }
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
      date: targetDate,
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
router.get('/reports/trends', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const trends = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
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
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:userId/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'employee', 'chef'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

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