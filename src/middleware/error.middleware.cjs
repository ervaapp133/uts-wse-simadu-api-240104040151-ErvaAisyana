const { sendError } = require('../utils/response.cjs');

/**
 * Handler untuk endpoint yang tidak terdaftar (404 Not Found).
 */
function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    errorCode: 'ENDPOINT_NOT_FOUND',
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
}

/**
 * Global Error Handler:
 * Menangani SyntaxError JSON, AppError operasional (400, 401, 403, 404),
 * dan error internal tak terduga (500) tanpa membocorkan stack trace ke client.
 */
function globalErrorHandler(err, req, res, next) {
  // Menangani body JSON rusak/malformed dari express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, {
      statusCode: 400,
      errorCode: 'INVALID_JSON',
      message: 'Format JSON pada body permintaan tidak valid.',
    });
  }

  if (err && err.isOperational) {
    return sendError(res, {
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      message: err.message,
      details: err.details,
    });
  }

  // Log kesalahan internal hanya di sisi server (tanpa header sensitif)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  }

  return sendError(res, {
    statusCode: 500,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.',
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
