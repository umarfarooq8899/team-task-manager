import express from 'express';
import passport from 'passport';
import Joi from 'joi';
import User from '../models/User.js';
import { ensureAuthenticated, ensureGuest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Name is required.',
    'string.empty': 'Name cannot be empty.',
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 100 characters.',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required.',
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Must be a valid email address.',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'any.required': 'Password is required.',
    'string.empty': 'Password cannot be empty.',
    'string.min': 'Password must be at least 6 characters long.',
    'string.max': 'Password cannot exceed 100 characters.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required.',
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Must be a valid email address.',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
    'string.empty': 'Password cannot be empty.',
  }),
});

// @route   POST /api/auth/register
// @desc    Register a new user and log them in
// @access  Public
router.post('/register', ensureGuest, validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Automatically log user in after registration
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login after registration failed.', error: err.message });
      }
      
      return res.status(201).json({
        message: 'Registration successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login a user and start session
// @access  Public
router.post('/login', ensureGuest, validateBody(loginSchema), (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error.', error: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: info?.message || 'Invalid credentials.' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Session initialization failed.', error: err.message });
      }

      return res.status(200).json({
        message: 'Login successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

// @route   POST /api/auth/logout
// @desc    Logout user and destroy session
// @access  Private
router.post('/logout', ensureAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed.', error: err.message });
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction failed.', error: err.message });
      }
      res.clearCookie('connect.sid'); // default session cookie name
      return res.status(200).json({ message: 'Logged out successfully.' });
    });
  });
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user
// @access  Private
router.get('/me', ensureAuthenticated, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

export default router;
