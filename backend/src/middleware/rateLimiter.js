const rateLimit = require('express-rate-limit');

// Throttles credential endpoints only (e.g. POST /auth/forgot-password).
//
// It must NOT cover GET /api/auth/me: the SPA calls that on every page load, so
// a 20-per-15-minutes cap here locks legitimate users out — and because the
// profile then fails to load, the app treats a signed-in admin as a stranger
// and redirects /admin to "Access Denied" (this happened for real). Failed
// password-reset attempts keep counting, which is what this limiter is for.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Upload rate limit exceeded.' },
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };
