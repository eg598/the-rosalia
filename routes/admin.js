'use strict';
const express  = require('express');
const { body, param, validationResult } = require('express-validator');
const multer   = require('multer');
const path     = require('path');
const authenticate = require('../middleware/authenticate');
const db       = require('../db/database');

const router = express.Router();
router.use(authenticate);

// ── Image upload (multer) ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Helper: return 400 if express-validator found errors
function checkValidation(req, res) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    res.status(400).json({ error: errs.array()[0].msg });
    return false;
  }
  return true;
}

// ── Stats ─────────────────────────────────────────────────────
router.get('/stats', (_req, res) => res.json(db.getStats()));

// ── Blog posts ────────────────────────────────────────────────
router.get('/posts', (_req, res) => res.json(db.getAllPosts()));

router.post('/posts',
  [
    body('title_es').trim().notEmpty().withMessage('Title (ES) is required'),
    body('content_es').trim().notEmpty().withMessage('Content (ES) is required'),
    body('published').optional().isBoolean(),
  ],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    const post = db.createPost(req.body);
    res.status(201).json(post);
  }
);

router.put('/posts/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid post ID'),
    body('title_es').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content_es').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('published').optional().isBoolean(),
  ],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    const post = db.updatePost(Number(req.params.id), req.body);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  }
);

router.delete('/posts/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid post ID')],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    const deleted = db.deletePost(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true });
  }
);

// ── Menu items ────────────────────────────────────────────────
const VALID_CATEGORIES = ['brunch', 'lunch_dinner', 'street_food', 'drinks'];

router.get('/menu-items', (_req, res) => res.json(db.getAllMenuItems()));

router.post('/menu-items',
  [
    body('name_es').trim().notEmpty().withMessage('Name (ES) is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category').isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    body('active').optional().isBoolean(),
  ],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    const item = db.createMenuItem(req.body);
    res.status(201).json(item);
  }
);

router.put('/menu-items/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid item ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category').optional().isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    body('active').optional().isBoolean(),
  ],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    const item = db.updateMenuItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  }
);

router.delete('/menu-items/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid item ID')],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    const deleted = db.deleteMenuItem(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ success: true });
  }
);

// ── Image upload ──────────────────────────────────────────────
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No valid image provided (max 5 MB, JPEG/PNG/WebP)' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
