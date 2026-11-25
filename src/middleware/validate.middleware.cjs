const AppError = require('../utils/appError.cjs');

const ALLOWED_KATEGORI = ['Fasilitas', 'Akademik', 'TI'];
const ALLOWED_STATUS = ['diajukan', 'diproses', 'selesai'];

function ensurePlainObject(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

function findUnexpectedFields(body, allowedFields) {
  return Object.keys(body).filter((key) => !allowedFields.includes(key));
}

function validateIdParam(req, res, next) {
  const rawId = req.params.id;
  if (!/^[1-9]\d*$/.test(String(rawId))) {
    return next(
      new AppError(
        'Parameter ID pengaduan harus berupa bilangan bulat positif.',
        400,
        'INVALID_ID_PARAM'
      )
    );
  }
  req.pengaduanId = Number.parseInt(rawId, 10);
  return next();
}

function validateLoginBody(req, res, next) {
  if (!ensurePlainObject(req.body)) {
    return next(
      new AppError('Body permintaan harus berupa objek JSON yang valid.', 400, 'VALIDATION_ERROR')
    );
  }

  const unexpected = findUnexpectedFields(req.body, ['username', 'password']);
  if (unexpected.length > 0) {
    return next(
      new AppError(
        `Field tidak diperbolehkan: ${unexpected.join(', ')}.`,
        400,
        'FORBIDDEN_FIELDS',
        { unexpectedFields: unexpected }
      )
    );
  }

  const { username, password } = req.body;
  const errors = [];

  if (typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Field username wajib diisi berupa string.');
  }
  if (typeof password !== 'string' || password.length === 0) {
    errors.push('Field password wajib diisi berupa string.');
  }

  if (errors.length > 0) {
    return next(
      new AppError('Validasi login gagal.', 400, 'VALIDATION_ERROR', errors)
    );
  }

  req.body.username = username.trim();
  return next();
}

function validatePengaduanPayload(req, res, next) {
  if (!ensurePlainObject(req.body)) {
    return next(
      new AppError('Body permintaan harus berupa objek JSON yang valid.', 400, 'VALIDATION_ERROR')
    );
  }

  // Tolak field terlarang seperti id, mahasiswaId, status, createdAt
  const allowedFields = ['judul', 'kategori', 'deskripsi'];
  const unexpected = findUnexpectedFields(req.body, allowedFields);
  if (unexpected.length > 0) {
    return next(
      new AppError(
        `Field berikut tidak diperbolehkan dikirim oleh client: ${unexpected.join(', ')}.`,
        400,
        'FORBIDDEN_FIELDS',
        {
          unexpectedFields: unexpected,
          allowedFields,
        }
      )
    );
  }

  const { judul, kategori, deskripsi } = req.body;
  const errors = [];

  if (typeof judul !== 'string' || judul.trim().length < 5 || judul.trim().length > 150) {
    errors.push('Field judul wajib diisi (5-150 karakter).');
  }

  if (typeof kategori !== 'string' || !ALLOWED_KATEGORI.includes(kategori.trim())) {
    errors.push(`Field kategori wajib salah satu dari: ${ALLOWED_KATEGORI.join(', ')}.`);
  }

  if (typeof deskripsi !== 'string' || deskripsi.trim().length < 10 || deskripsi.trim().length > 1000) {
    errors.push('Field deskripsi wajib diisi (10-1000 karakter).');
  }

  if (errors.length > 0) {
    return next(
      new AppError('Validasi data pengaduan gagal.', 400, 'VALIDATION_ERROR', errors)
    );
  }

  req.body = {
    judul: judul.trim(),
    kategori: kategori.trim(),
    deskripsi: deskripsi.trim(),
  };

  return next();
}

function validateStatusPayload(req, res, next) {
  if (!ensurePlainObject(req.body)) {
    return next(
      new AppError('Body permintaan harus berupa objek JSON yang valid.', 400, 'VALIDATION_ERROR')
    );
  }

  const unexpected = findUnexpectedFields(req.body, ['status']);
  if (unexpected.length > 0) {
    return next(
      new AppError(
        `Field tidak diperbolehkan pada pembaruan status: ${unexpected.join(', ')}.`,
        400,
        'FORBIDDEN_FIELDS',
        { unexpectedFields: unexpected, allowedFields: ['status'] }
      )
    );
  }

  const { status } = req.body;
  if (typeof status !== 'string' || !ALLOWED_STATUS.includes(status.trim())) {
    return next(
      new AppError(
        `Field status wajib salah satu dari: ${ALLOWED_STATUS.join(', ')}.`,
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  req.body = { status: status.trim() };
  return next();
}

function validateListQuery(req, res, next) {
  const { kategori, status } = req.query;
  const errors = [];

  if (kategori !== undefined && !ALLOWED_KATEGORI.includes(String(kategori))) {
    errors.push(`Filter kategori harus salah satu dari: ${ALLOWED_KATEGORI.join(', ')}.`);
  }
  if (status !== undefined && !ALLOWED_STATUS.includes(String(status))) {
    errors.push(`Filter status harus salah satu dari: ${ALLOWED_STATUS.join(', ')}.`);
  }

  if (errors.length > 0) {
    return next(new AppError('Parameter query tidak valid.', 400, 'VALIDATION_ERROR', errors));
  }

  return next();
}

module.exports = {
  ALLOWED_KATEGORI,
  ALLOWED_STATUS,
  validateIdParam,
  validateLoginBody,
  validatePengaduanPayload,
  validateStatusPayload,
  validateListQuery,
};
