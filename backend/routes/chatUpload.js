const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter — images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/chat/upload
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { userId } = req.body;
    if (!userId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'userId is required' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/chat/${req.file.filename}`;

    res.status(200).json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Max 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
