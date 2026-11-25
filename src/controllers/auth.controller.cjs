const authService = require('../services/auth.service.cjs');
const { sendSuccess } = require('../utils/response.cjs');

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login berhasil.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
};
