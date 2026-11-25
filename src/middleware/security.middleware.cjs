const AppError = require('../utils/appError.cjs');

/**
 * Menambahkan HTTP Security Headers dasar pada setiap respons.
 */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Powered-By', 'SIMADU-API');
  next();
}

/**
 * Logger permintaan yang aman:
 * Tidak pernah mencatat header Authorization / Bearer Token maupun password ke log.
 */
function sanitizedRequestLogger(req, res, next) {
  const start = Date.now();
  const hasAuthHeader = Boolean(req.headers.authorization);

  res.on('finish', () => {
    if (process.env.NODE_ENV === 'test') return;
    const duration = Date.now() - start;
    const authMarker = hasAuthHeader ? 'Auth:[REDACTED]' : 'Auth:None';
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) | ${authMarker}`
    );
  });

  next();
}

/**
 * Pengembangan Tambahan Opsional (Soal 3):
 * Validasi x-api-key jika ENABLE_API_KEY=true di .env.
 * API Key hanya mengidentifikasi aplikasi client (web/mobile),
 * TIDAK menggantikan autentikasi Bearer Token dan otorisasi role.
 */
function optionalApiKeyGuard(req, res, next) {
  if (process.env.ENABLE_API_KEY !== 'true') {
    return next();
  }

  const providedKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!providedKey || providedKey !== expectedKey) {
    return next(
      new AppError(
        'API Key tidak valid atau tidak disertakan pada header x-api-key.',
        401,
        'INVALID_API_KEY'
      )
    );
  }

  return next();
}

/**
 * Rate Limiter khusus endpoint login (maksimal 5 percobaan per menit per IP).
 */
const loginAttempts = new Map();

function loginRateLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 5;

  const record = loginAttempts.get(ip);
  if (!record || now - record.startTime > windowMs) {
    loginAttempts.set(ip, { count: 1, startTime: now });
    return next();
  }

  record.count += 1;
  if (record.count > maxAttempts) {
    return next(
      new AppError(
        'Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.',
        429,
        'TOO_MANY_REQUESTS'
      )
    );
  }

  return next();
}

module.exports = {
  securityHeaders,
  sanitizedRequestLogger,
  optionalApiKeyGuard,
  loginRateLimiter,
};