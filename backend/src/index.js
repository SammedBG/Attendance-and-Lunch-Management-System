import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';

// Import configurations
import connectDB from './config/database.js';
import { setupCronJobs } from './config/cron.js';
import { seedData } from './config/seed.js';

// Import routes
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';
import chefRoutes from './routes/chef.js';

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here' && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: Your JWT_SECRET is extremely weak or missing!');
}

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Standard Middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Sanitize user-supplied data to prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chef', chefRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setupCronJobs();
  seedData();
});
