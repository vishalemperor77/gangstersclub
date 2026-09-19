const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { uploadLimiter } = require('./rateLimiter');

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new Error('Unsupported file type. Allowed: JPG, PNG, WebP, AVIF.'));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES },
});

function safeExt(mimetype) {
  return { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' }[mimetype] || '.bin';
}

/** Builds a tamper-safe filename: <userId>/<random>.<ext> */
function buildFileName(userId, mimetype) {
  return `${userId}/${crypto.randomBytes(16).toString('hex')}${safeExt(mimetype)}`;
}

module.exports = { upload, buildFileName, MAX_BYTES, uploadLimiter };
