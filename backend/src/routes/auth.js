import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import { clearCsrfCookie, generateCsrfToken, setCsrfCookie } from '../middleware/csrf.js';

const router = express.Router();

// Strict Rate Limiting for Login/Register to prevent Brute-Force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window for authentication
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

// Pre-auth CSRF token
router.get('/csrf', (req, res) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  res.json({ message: 'CSRF token set' });
});

// Login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
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

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL ERROR: No JWT_SECRET configured.');
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 Minute Access Ticket
    );
    
    // Provide a fallback secret just in case JWT_REFRESH_SECRET isn't natively bound yet
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign(
      { userId: user._id },
      refreshSecret,
      { expiresIn: '7d' } // Secure 7-Day Background Resurrector
    );
    
    // Set HTTP-only, secure Access Cookie
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set HTTP-only, secure Refresh Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/auth/refresh', // Strict: The browser ONLY sends this heavy token to the refresh route!
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.json({
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

// Refresh Token Rotator Pipeline
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token completely missing' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    
    // Verify legitimacy of heavy lifecycle token
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User bound to refresh token no longer exists' });
    }

    // Generate brand new 15-minute key
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } 
    );

    // Blast it down to the browser automatically replacing the expired memory string
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 Mins
    });

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.json({ message: 'Access smoothly restored' });

  } catch (error) {
    console.error('Refresh Token Validation Failure:', error);
    res.status(403).json({ message: 'Invalid or catastrophically expired refresh token' });
  }
});

// Logout Destructor Handler
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh',
  });
  clearCsrfCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  if (!req.cookies?.csrfToken) {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
  }
  res.json(req.user);
});

export default router;
