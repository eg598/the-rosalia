'use strict';
require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const fs          = require('fs');

const authRouter  = require('./routes/auth');
const adminRouter = require('./routes/admin');
const db          = require('./db/database');

// ── Guards ────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── App ───────────────────────────────────────────────────────
const app  = express();
const PORT = Number(process.env.PORT) || 3000;

// Security headers (CSP disabled to keep Google Fonts working out-of-box;
// enable and tune it for production with proper nonce/hash configuration)
app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ── Rate limiting on auth endpoints ──────────────────────────
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             10,             // max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',  authLimiter, authRouter);
app.use('/api/admin', adminRouter);

// ── Admin panel HTML routes ───────────────────────────────────
app.get('/admin', (_req, res) =>
  res.sendFile(path.join(__dirname, 'admin', 'index.html'))
);
app.get('/admin/dashboard', (_req, res) =>
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'))
);

// ── Static files ──────────────────────────────────────────────
// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));
// Serve the admin panel assets (CSS, JS)
app.use('/admin', express.static(path.join(__dirname, 'admin')));
// Serve the public website
app.use(express.static(path.join(__dirname), { index: 'index.html' }));

// ── 404 fallback ─────────────────────────────────────────────
app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'index.html')));

// ── Start ─────────────────────────────────────────────────────
db.initialize();

app.listen(PORT, () => {
  console.log(`\n  The Rosalia BCN — running at http://localhost:${PORT}`);
  console.log(`  Admin panel → http://localhost:${PORT}/admin\n`);
});
