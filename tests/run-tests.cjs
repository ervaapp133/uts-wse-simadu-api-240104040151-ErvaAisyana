/**
 * Automated Functional & Security Test Suite — SIMADU API
 * Mahasiswa: Erva Aisyana | NIM: 240104040151 | Kelas: TI24A
 *
 * Menjalankan 12 skenario wajib Soal 4 + 4 skenario keamanan tambahan
 * secara otomatis dan menyimpan bukti respons aktual ke docs/hasil-pengujian-aktual.json.
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../app.cjs');
const pengaduanRepo = require('../src/repositories/pengaduan.repository.cjs');

function request(port, method, urlPath, { token = null, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body !== null ? JSON.stringify(body) : null;
    const headers = {};
    if (payload !== null) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(
      { hostname: '127.0.0.1', port, method, path: urlPath, headers },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(raw); } catch { json = raw; }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on('error', reject);
    if (payload !== null) req.write(payload);
    req.end();
  });
}

async function run() {
  pengaduanRepo.resetStore();
  const server = app.listen(0);
  const { port } = server.address();

  const results = [];
  let tokenMhs = '';
  let tokenAdmin = '';
  let createdId = null;

  const record = (no, skenario, expected, res, extraCheck = true) => {
    const passed = res.status === expected && extraCheck;
    results.push({
      no,
      skenario,
      expectedStatus: expected,
      actualStatus: res.status,
      passed,
      actualResponse: res.body,
    });
    const icon = passed ? 'PASS' : 'FAIL';
    console.log(`[${icon}] #${String(no).padStart(2, '0')} | Expected: ${expected} | Actual: ${res.status} | ${skenario}`);
  };

  try {
    console.log('====================================================================');
    console.log('  PENGUJIAN FUNGSIONAL & KEAMANAN SIMADU API (16 SKENARIO)          ');
    console.log('  Mahasiswa: Erva Aisyana | NIM: 240104040151 | Kelas: TI24A        ');
    console.log('====================================================================');

    // 1. Login kredensial benar (Mahasiswa)
    const r1 = await request(port, 'POST', '/api/auth/login', {
      body: { username: 'erva.aisyana', password: 'Mhs12345!' },
    });
    tokenMhs = r1.body?.data?.accessToken || '';
    record(1, 'Login dengan kredensial benar (Mahasiswa)', 200, r1, Boolean(tokenMhs));

    // Login Admin untuk skenario admin
    const rAdminLogin = await request(port, 'POST', '/api/auth/login', {
      body: { username: 'admin.simadu', password: 'Admin12345!' },
    });
    tokenAdmin = rAdminLogin.body?.data?.accessToken || '';

    // 2. Login password salah
    const r2 = await request(port, 'POST', '/api/auth/login', {
      body: { username: 'erva.aisyana', password: 'PasswordSalah999' },
    });
    record(2, 'Login dengan password salah', 401, r2);

    // 3. Akses endpoint terlindungi tanpa token
    const r3 = await request(port, 'GET', '/api/pengaduan');
    record(3, 'Akses endpoint terlindungi tanpa token', 401, r3);

    // 4. Akses menggunakan token tidak valid
    const r4 = await request(port, 'GET', '/api/pengaduan', {
      token: 'token.palsu.tidakvalid',
    });
    record(4, 'Akses menggunakan token tidak valid', 401, r4);

    // 5. Mahasiswa membuat pengaduan valid
    const r5 = await request(port, 'POST', '/api/pengaduan', {
      token: tokenMhs,
      body: {
        judul: 'WiFi Perpustakaan Lantai 2 Sering Terputus',
        kategori: 'TI',
        deskripsi: 'Koneksi WiFi kampus di area baca lantai 2 sering disconnect saat mengakses jurnal online.',
      },
    });
    createdId = r5.body?.data?.id;
    record(5, 'Mahasiswa membuat pengaduan valid', 201, r5, r5.body?.data?.mahasiswaId === '240104040151');

    // 6. Mahasiswa membaca pengaduan sendiri
    const r6 = await request(port, 'GET', '/api/pengaduan/1', { token: tokenMhs });
    record(6, 'Mahasiswa membaca pengaduan sendiri', 200, r6, r6.body?.data?.id === 1);

    // 7. Mahasiswa mencoba membaca pengaduan orang lain
    const r7 = await request(port, 'GET', '/api/pengaduan/3', { token: tokenMhs });
    record(7, 'Mahasiswa mencoba membaca pengaduan orang lain', 403, r7);

    // 8. Mahasiswa mengubah status pengaduan
    const r8 = await request(port, 'PATCH', '/api/pengaduan/1/status', {
      token: tokenMhs,
      body: { status: 'selesai' },
    });
    record(8, 'Mahasiswa mengubah status pengaduan', 403, r8);

    // 9. Admin melihat seluruh pengaduan
    const r9 = await request(port, 'GET', '/api/pengaduan', { token: tokenAdmin });
    record(9, 'Admin melihat seluruh pengaduan', 200, r9, Array.isArray(r9.body?.data) && r9.body.data.length >= 4);

    // 10. Admin memperbarui status pengaduan
    const r10 = await request(port, 'PATCH', '/api/pengaduan/1/status', {
      token: tokenAdmin,
      body: { status: 'diproses' },
    });
    record(10, 'Admin memperbarui status pengaduan', 200, r10, r10.body?.data?.status === 'diproses' && r10.body?.data?.mahasiswaId === '240104040151');

    // 11. Membuat pengaduan dengan field wajib kosong
    const r11 = await request(port, 'POST', '/api/pengaduan', {
      token: tokenMhs,
      body: { judul: '', kategori: 'TI', deskripsi: '' },
    });
    record(11, 'Membuat pengaduan dengan field wajib kosong', 400, r11);

    // 12. Mengakses ID pengaduan yang tidak ditemukan
    const r12 = await request(port, 'GET', '/api/pengaduan/9999', { token: tokenMhs });
    record(12, 'Mengakses ID pengaduan yang tidak ditemukan', 404, r12);

    // 13. Bonus: Mahasiswa mengubah pengaduan sendiri saat status 'diajukan'
    const r13 = await request(port, 'PUT', `/api/pengaduan/${createdId}`, {
      token: tokenMhs,
      body: {
        judul: 'WiFi Perpustakaan Lantai 2 Tidak Stabil (Diperbarui)',
        kategori: 'TI',
        deskripsi: 'Koneksi WiFi di ruang baca lantai 2 terputus setiap 10 menit saat jam sibuk kuliah.',
      },
    });
    record(13, '[Bonus] Mahasiswa mengubah pengaduan sendiri (status diajukan)', 200, r13);

    // 14. Bonus: Tolak field terlarang (mahasiswaId & status)
    const r14 = await request(port, 'POST', '/api/pengaduan', {
      token: tokenMhs,
      body: {
        mahasiswaId: '240104040199',
        status: 'selesai',
        judul: 'Percobaan Manipulasi Kepemilikan',
        kategori: 'Akademik',
        deskripsi: 'Mencoba menentukan mahasiswaId dan status secara bebas dari sisi client.',
      },
    });
    record(14, '[Bonus] Tolak field terlarang (mahasiswaId/status)', 400, r14);

    // 15. Bonus: Mahasiswa mencoba menghapus pengaduan yang sudah 'diproses'
    const r15 = await request(port, 'DELETE', '/api/pengaduan/2', { token: tokenMhs });
    record(15, '[Bonus] Mahasiswa hapus pengaduan berstatus diproses ditolak', 403, r15);

    // 16. Bonus: Mahasiswa menghapus pengaduan sendiri saat status 'diajukan'
    const r16 = await request(port, 'DELETE', `/api/pengaduan/${createdId}`, { token: tokenMhs });
    record(16, '[Bonus] Mahasiswa hapus pengaduan sendiri (status diajukan)', 200, r16);

    const passedCount = results.filter((r) => r.passed).length;
    console.log('====================================================================');
    console.log(`  RINGKASAN: ${passedCount}/${results.length} skenario LULUS (PASS)`);
    console.log('====================================================================');

    const outputPath = path.join(__dirname, '..', 'docs', 'hasil-pengujian-aktual.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          executedAt: new Date().toISOString(),
          author: 'Erva Aisyana (240104040151 - TI24A)',
          summary: { total: results.length, passed: passedCount, failed: results.length - passedCount },
          results,
        },
        null,
        2
      ),
      'utf8'
    );
    console.log(`  Bukti respons aktual tersimpan di: docs/hasil-pengujian-aktual.json`);

    if (passedCount !== results.length) {
      process.exitCode = 1;
    }
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('Gagal menjalankan test suite:', err);
  process.exit(1);
});
