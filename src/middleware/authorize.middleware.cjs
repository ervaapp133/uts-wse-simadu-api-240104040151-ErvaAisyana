const AppError = require('../utils/appError.cjs');

/**
 * Middleware Otorisasi berbasis Role (RBAC):
 * Membatasi akses endpoint hanya untuk role yang diizinkan pada matriks hak akses.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          'Pengguna belum terautentikasi.',
          401,
          'UNAUTHORIZED'
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk operasi ini.`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};
