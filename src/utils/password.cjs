const crypto = require('crypto');

/**
 * Menghasilkan hash password menggunakan Scrypt (salted KDF).
 * Format penyimpanan: "<saltHex>:<derivedKeyHex>"
 */
function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Memverifikasi password plaintext terhadap hash tersimpan
 * menggunakan crypto.timingSafeEqual untuk mencegah timing attack.
 */
function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, keyHex] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  const storedKeyBuffer = Buffer.from(keyHex, 'hex');

  if (derivedKey.length !== storedKeyBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(derivedKey, storedKeyBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
