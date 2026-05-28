'use strict';
const express  = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db/database');

const router = express.Router();

const COOKIE = 'rosalia_token';
const cookieOpts = {
  httpOnly: true,
  sameSite: 'strict',
  maxAge:   24 * 60 * 60 * 1000, // 24 h in ms
  // secure: true  ← enable in production (HTTPS)
};

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const { email, password } = req.body;
    const user = db.getUserByEmail(email);

    // Always run bcrypt to prevent timing attacks on non-existent accounts
    const hash = user ? user.password_hash : '$2b$12$invalidhashfortimingnullroutenow';
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    res.cookie(COOKIE, token, cookieOpts);
    res.json({ success: true, email: user.email });
  }
);

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.cookies[COOKIE];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded.email });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
