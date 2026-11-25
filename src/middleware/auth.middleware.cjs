const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError.cjs');
const { getJwtSecret } = require('../services/auth.service.cjs');

/**
 * Middleware Autentikasi (Bearer Token):
 * Memastikan header Authorization menggunakan skema Bearer,
 * memverifikasi tanda tangan JWT, dan memeriksa masa kedaluwarsa di server.
 */
function authenticateBearer(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        'Autentikasi diperlukan. Sertakan header Authorization: Bearer <token>.',
        401,
        'TOKEN_MISSING'
      )
    );
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(
      new AppError(
        'Token autentikasi kosong atau tidak valid.',
        401,
        'TOKEN_INVALID'
      )
    );
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'simadu-api',
    });

    req.user = {
      id: decoded.sub,
      username: decoded.username,
      nama: decoded.nama,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError(
          'Token autentikasi telah kedaluwarsa. Silakan login kembali.',
          401,
          'TOKEN_EXPIRED'
        )
      );
    }

    return next(
      new AppError(
        'Token autentikasi tidak valid.',
        401,
        'TOKEN_INVALID'
      )
    );
  }
}

module.exports = {
  authenticateBearer,
};
