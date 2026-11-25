/**
 * Helper format respons JSON konsisten di seluruh endpoint SIMADU API.
 */
function sendSuccess(res, { statusCode = 200, message = 'Berhasil', data = null, meta = null }) {
  const payload = {
    success: true,
    message,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

function sendError(res, { statusCode = 500, errorCode = 'INTERNAL_ERROR', message = 'Terjadi kesalahan pada server', details = null }) {
  const payload = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
