const express = require('express');
const pengaduanController = require('../controllers/pengaduan.controller.cjs');
const { authenticateBearer } = require('../middleware/auth.middleware.cjs');
const { authorizeRoles } = require('../middleware/authorize.middleware.cjs');
const {
  validateIdParam,
  validatePengaduanPayload,
  validateStatusPayload,
  validateListQuery,
} = require('../middleware/validate.middleware.cjs');

const router = express.Router();

// Seluruh endpoint /api/pengaduan wajib terautentikasi menggunakan Bearer Token
router.use(authenticateBearer);

// GET /api/pengaduan -> Mahasiswa (milik sendiri) & Admin (semua)
router.get(
  '/',
  authorizeRoles('mahasiswa', 'admin'),
  validateListQuery,
  pengaduanController.getAll
);

// GET /api/pengaduan/:id -> Mahasiswa (milik sendiri) & Admin (semua)
router.get(
  '/:id',
  authorizeRoles('mahasiswa', 'admin'),
  validateIdParam,
  pengaduanController.getById
);

// POST /api/pengaduan -> Khusus Mahasiswa
router.post(
  '/',
  authorizeRoles('mahasiswa'),
  validatePengaduanPayload,
  pengaduanController.create
);

// PUT /api/pengaduan/:id -> Khusus Mahasiswa pemilik (selama status 'diajukan')
router.put(
  '/:id',
  authorizeRoles('mahasiswa'),
  validateIdParam,
  validatePengaduanPayload,
  pengaduanController.update
);

// PATCH /api/pengaduan/:id/status -> Khusus Administrator
router.patch(
  '/:id/status',
  authorizeRoles('admin'),
  validateIdParam,
  validateStatusPayload,
  pengaduanController.updateStatus
);

// DELETE /api/pengaduan/:id -> Khusus Mahasiswa pemilik (selama status 'diajukan')
router.delete(
  '/:id',
  authorizeRoles('mahasiswa'),
  validateIdParam,
  pengaduanController.remove
);

module.exports = router;
