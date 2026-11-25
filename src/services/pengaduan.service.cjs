const pengaduanRepository = require('../repositories/pengaduan.repository.cjs');
const AppError = require('../utils/appError.cjs');

/**
 * Mengambil daftar pengaduan sesuai hak akses:
 * - Admin: melihat seluruh pengaduan
 * - Mahasiswa: hanya melihat pengaduannya sendiri
 */
function listPengaduan(currentUser, filter = {}) {
  let items =
    currentUser.role === 'admin'
      ? pengaduanRepository.findAll()
      : pengaduanRepository.findByMahasiswaId(currentUser.id);

  if (filter.kategori) {
    items = items.filter((item) => item.kategori === filter.kategori);
  }
  if (filter.status) {
    items = items.filter((item) => item.status === filter.status);
  }

  return items;
}

/**
 * Mengambil detail pengaduan berdasarkan ID dengan pengecekan kepemilikan.
 */
function getPengaduanById(id, currentUser) {
  const pengaduan = pengaduanRepository.findById(id);
  if (!pengaduan) {
    throw new AppError(
      `Pengaduan dengan ID ${id} tidak ditemukan.`,
      404,
      'PENGADUAN_NOT_FOUND'
    );
  }

  if (currentUser.role === 'mahasiswa' && pengaduan.mahasiswaId !== currentUser.id) {
    throw new AppError(
      'Akses ditolak. Anda hanya diperbolehkan melihat pengaduan milik sendiri.',
      403,
      'FORBIDDEN_OWNERSHIP'
    );
  }

  return pengaduan;
}

/**
 * Membuat pengaduan baru.
 * ID dan mahasiswaId selalu ditentukan oleh server dari hasil autentikasi.
 */
function createPengaduan({ judul, kategori, deskripsi }, currentUser) {
  return pengaduanRepository.create({
    mahasiswaId: currentUser.id,
    judul,
    kategori,
    deskripsi,
  });
}

/**
 * Mengubah isi pengaduan (judul, kategori, deskripsi).
 * Hanya mahasiswa pemiliknya yang boleh mengubah, dan hanya selama status === 'diajukan'.
 */
function updatePengaduan(id, { judul, kategori, deskripsi }, currentUser) {
  const existing = pengaduanRepository.findById(id);
  if (!existing) {
    throw new AppError(
      `Pengaduan dengan ID ${id} tidak ditemukan.`,
      404,
      'PENGADUAN_NOT_FOUND'
    );
  }

  if (existing.mahasiswaId !== currentUser.id) {
    throw new AppError(
      'Akses ditolak. Anda tidak diperbolehkan mengubah pengaduan milik mahasiswa lain.',
      403,
      'FORBIDDEN_OWNERSHIP'
    );
  }

  if (existing.status !== 'diajukan') {
    throw new AppError(
      `Pengaduan dengan status '${existing.status}' tidak dapat diubah lagi. Perubahan hanya diizinkan saat status 'diajukan'.`,
      403,
      'STATUS_LOCKED'
    );
  }

  return pengaduanRepository.updateContent(id, { judul, kategori, deskripsi });
}

/**
 * Memperbarui status pengaduan (khusus Administrator).
 */
function updateStatusPengaduan(id, status) {
  const existing = pengaduanRepository.findById(id);
  if (!existing) {
    throw new AppError(
      `Pengaduan dengan ID ${id} tidak ditemukan.`,
      404,
      'PENGADUAN_NOT_FOUND'
    );
  }

  return pengaduanRepository.updateStatus(id, status);
}

/**
 * Menghapus pengaduan.
 * Hanya mahasiswa pemiliknya yang boleh menghapus, dan hanya selama status === 'diajukan'.
 */
function deletePengaduan(id, currentUser) {
  const existing = pengaduanRepository.findById(id);
  if (!existing) {
    throw new AppError(
      `Pengaduan dengan ID ${id} tidak ditemukan.`,
      404,
      'PENGADUAN_NOT_FOUND'
    );
  }

  if (existing.mahasiswaId !== currentUser.id) {
    throw new AppError(
      'Akses ditolak. Anda tidak diperbolehkan menghapus pengaduan milik mahasiswa lain.',
      403,
      'FORBIDDEN_OWNERSHIP'
    );
  }

  if (existing.status !== 'diajukan') {
    throw new AppError(
      `Pengaduan dengan status '${existing.status}' tidak dapat dihapus. Penghapusan hanya diizinkan saat status 'diajukan'.`,
      403,
      'STATUS_LOCKED'
    );
  }

  return pengaduanRepository.remove(id);
}

module.exports = {
  listPengaduan,
  getPengaduanById,
  createPengaduan,
  updatePengaduan,
  updateStatusPengaduan,
  deletePengaduan,
};
