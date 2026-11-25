/**
 * Repository Pengaduan (In-Memory)
 * Bertanggung jawab penuh atas operasi baca, tulis, ubah, dan hapus data pengaduan.
 */
const initialPengaduan = [
  {
    id: 1,
    mahasiswaId: '240104040151',
    judul: 'AC Ruang Kelas 1.2 Kurang Dingin',
    kategori: 'Fasilitas',
    deskripsi: 'Pendingin ruangan di Kelas 1.2 gedung TI sering mati sendiri saat jam kuliah siang.',
    status: 'diajukan',
    createdAt: '2026-11-18T08:30:00.000Z',
  },
  {
    id: 2,
    mahasiswaId: '240104040151',
    judul: 'Kendala Akses Portal Akademik Saat KRS',
    kategori: 'TI',
    deskripsi: 'Portal akademik mengalami timeout saat mahasiswa melakukan pengisian KRS pada jam sibuk.',
    status: 'diproses',
    createdAt: '2026-11-19T09:15:00.000Z',
  },
  {
    id: 3,
    mahasiswaId: '240104040199',
    judul: 'Jadwal Praktikum Bentrok dengan Mata Kuliah Wajib',
    kategori: 'Akademik',
    deskripsi: 'Terdapat jadwal praktikum laboratorium yang bersamaan dengan jadwal kuliah teori kelas TI24A.',
    status: 'diajukan',
    createdAt: '2026-11-19T10:00:00.000Z',
  },
];

let pengaduanStore = initialPengaduan.map((item) => ({ ...item }));
let nextId = 4;

function findAll() {
  return pengaduanStore.map((item) => ({ ...item }));
}

function findByMahasiswaId(mahasiswaId) {
  return pengaduanStore
    .filter((item) => item.mahasiswaId === mahasiswaId)
    .map((item) => ({ ...item }));
}

function findById(id) {
  const found = pengaduanStore.find((item) => item.id === id);
  return found ? { ...found } : null;
}

function create({ mahasiswaId, judul, kategori, deskripsi }) {
  const newRecord = {
    id: nextId++,
    mahasiswaId,
    judul,
    kategori,
    deskripsi,
    status: 'diajukan',
    createdAt: new Date().toISOString(),
  };
  pengaduanStore.push(newRecord);
  return { ...newRecord };
}

function updateContent(id, { judul, kategori, deskripsi }) {
  const index = pengaduanStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  pengaduanStore[index] = {
    ...pengaduanStore[index],
    judul,
    kategori,
    deskripsi,
  };
  return { ...pengaduanStore[index] };
}

function updateStatus(id, status) {
  const index = pengaduanStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  // Administrator tidak dapat mengubah identitas pemilik (mahasiswaId tetap utuh)
  pengaduanStore[index] = {
    ...pengaduanStore[index],
    status,
  };
  return { ...pengaduanStore[index] };
}

function remove(id) {
  const index = pengaduanStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const [deleted] = pengaduanStore.splice(index, 1);
  return { ...deleted };
}

function resetStore() {
  pengaduanStore = initialPengaduan.map((item) => ({ ...item }));
  nextId = 4;
}

module.exports = {
  findAll,
  findByMahasiswaId,
  findById,
  create,
  updateContent,
  updateStatus,
  remove,
  resetStore,
};
