const pengaduanService = require('../services/pengaduan.service.cjs');
const { sendSuccess } = require('../utils/response.cjs');

function getAll(req, res, next) {
  try {
    const data = pengaduanService.listPengaduan(req.user, {
      kategori: req.query.kategori,
      status: req.query.status,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Daftar pengaduan berhasil diambil.',
      data,
      meta: {
        total: data.length,
        scope: req.user.role === 'admin' ? 'semua_pengaduan' : 'pengaduan_sendiri',
      },
    });
  } catch (err) {
    return next(err);
  }
}

function getById(req, res, next) {
  try {
    const data = pengaduanService.getPengaduanById(req.pengaduanId, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail pengaduan berhasil diambil.',
      data,
    });
  } catch (err) {
    return next(err);
  }
}

function create(req, res, next) {
  try {
    const created = pengaduanService.createPengaduan(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Pengaduan berhasil dibuat.',
      data: created,
    });
  } catch (err) {
    return next(err);
  }
}

function update(req, res, next) {
  try {
    const updated = pengaduanService.updatePengaduan(req.pengaduanId, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Pengaduan berhasil diperbarui.',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

function updateStatus(req, res, next) {
  try {
    const updated = pengaduanService.updateStatusPengaduan(req.pengaduanId, req.body.status);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Status pengaduan berhasil diperbarui.',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

function remove(req, res, next) {
  try {
    const deleted = pengaduanService.deletePengaduan(req.pengaduanId, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Pengaduan berhasil dihapus.',
      data: deleted,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
};
