const express = require('express');
const authController = require('../controllers/auth.controller.cjs');
const { validateLoginBody } = require('../middleware/validate.middleware.cjs');

const router = express.Router();

// POST /api/auth/login -> Autentikasi pengguna
router.post('/login', validateLoginBody, authController.login);

module.exports = router;
