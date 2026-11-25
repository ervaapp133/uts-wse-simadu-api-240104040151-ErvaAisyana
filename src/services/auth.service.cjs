const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository.cjs');
const { verifyPassword } = require('../utils/password.cjs');
const AppError = require('../utils/appError.cjs');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'simadu-uts-wse-2026-erva-aisyana-dev-secret';
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '1h';
}

/**
 * Autentikasi pengguna dan penerbitan JWT unik dengan masa berlaku (expiry).
 */
function login({ username, password }) {
  const user = userRepository.findByUsername(username);

  // Pesan kesalahan dibuat seragam agar tidak membocorkan apakah username terdaftar
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AppError(
      'Username atau password tidak valid.',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  const payload = {
    sub: user.id,
    username: user.username,
    nama: user.nama,
    role: user.role,
  };

  const expiresIn = getJwtExpiresIn();
  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn,
    issuer: 'simadu-api',
  });

  return {
    tokenType: 'Bearer',
    accessToken: token,
    expiresIn,
    user: {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
    },
  };
}

module.exports = {
  login,
  getJwtSecret,
};
