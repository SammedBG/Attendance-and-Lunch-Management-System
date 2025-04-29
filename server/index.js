import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (in a real app, use environment variables)
mongoose.connect('mongodb://localhost:27017/lunch-attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee', 'chef'], default: 'employee' }
});

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['office', 'home', 'leave'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role middleware
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'employee' // Default role for new registrations
    });

    await user.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Attendance routes
app.post('/api/attendance', authMiddleware, roleMiddleware(['employee', 'admin']), async (req, res) => {
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

app.get('/api/attendance', authMiddleware, async (req, res) => {
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

app.get('/api/attendance/monthly', authMiddleware, async (req, res) => {
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

// Chef routes
app.get('/api/chef/daily-count', authMiddleware, roleMiddleware(['chef', 'admin']), async (req, res) => {
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

// Admin routes
app.get('/api/admin/reports/daily', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
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
    
    const employees = attendanceRecords.map(record => ({
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

app.get('/api/admin/reports/trends', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Get attendance counts for each day in the date range
    const days = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const officeCount = await Attendance.countDocuments({
        date: { $gte: currentDate, $lt: nextDay },
        status: 'office'
      });
      
      const homeCount = await Attendance.countDocuments({
        date: { $gte: currentDate, $lt: nextDay },
        status: 'home'
      });
      
      const leaveCount = await Attendance.countDocuments({
        date: { $gte: currentDate, $lt: nextDay },
        status: 'leave'
      });
      
      days.push({
        date: new Date(currentDate),
        officeCount,
        homeCount,
        leaveCount
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json(days);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:userId/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
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

// Schedule daily notification for chef at 9:30 AM (except weekends)
cron.schedule('30 9 * * 1-5', async () => {
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
    
    console.log(`[${new Date().toISOString()}] Chef notification: ${count} employees in office today`);
    
    // In a real application, you would send an email or push notification to the chef
    // For example:
    // await sendEmailToChef(count);
    // or
    // await sendPushNotification('chef', { count });
  } catch (error) {
    console.error('Chef notification error:', error);
  }
});

// Seed initial data (for demo purposes)
const seedData = async () => {
  try {
    // Check if there are existing users
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial data...');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin'
      });
      await admin.save();
      
      // Create employee user
      const employeePassword = await bcrypt.hash('employee123', 10);
      const employee = new User({
        name: 'John Employee',
        email: 'employee@example.com',
        password: employeePassword,
        role: 'employee'
      });
      await employee.save();
      
      // Create chef user
      const chefPassword = await bcrypt.hash('chef123', 10);
      const chef = new User({
        name: 'Chef User',
        email: 'chef@example.com',
        password: chefPassword,
        role: 'chef'
      });
      await chef.save();
      
      console.log('Initial data seeded');
    }
  } catch (error) {
    console.error('Seed data error:', error);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedData();
});