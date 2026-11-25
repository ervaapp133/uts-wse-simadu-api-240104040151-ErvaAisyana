const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./src/routes/auth.routes.cjs');
const pengaduanRoutes = require('./src/routes/pengaduan.routes.cjs');
const {
  securityHeaders,
  sanitizedRequestLogger,
  optionalApiKeyGuard,
} = require('./src/middleware/security.middleware.cjs');
const {
  notFoundHandler,
  globalErrorHandler,
} = require('./src/middleware/error.middleware.cjs');

const app = express();

// 1. Global Security & Parsing Middleware
app.use(securityHeaders);
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(sanitizedRequestLogger);

// 2. Dokumentasi OpenAPI & Swagger UI (/api-docs)
const openApiPath = path.join(__dirname, 'docs', 'openapi.json');
const openApiDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));

const swaggerCustomCss = `
  .swagger-ui .topbar { background: linear-gradient(90deg, #f8c8dc 0%, #c8e7fa 100%); border-bottom: 1px solid #e2e8f0; }
  .swagger-ui .topbar .download-url-wrapper { display: none; }
  .swagger-ui .info .title { color: #2d3748; font-family: 'Segoe UI', sans-serif; }
  .swagger-ui .btn.authorize { border-color: #63b3ed; color: #2b6cb0; }
`;

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'SIMADU API Docs — Erva Aisyana (240104040151)',
    customCss: swaggerCustomCss,
  })
);

// Endpoint raw OpenAPI JSON
app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

// 3. Landing Page Kreatif & Informatif (GET /)
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SIMADU API — Erva Aisyana (240104040151)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #fff1f5 0%, #eef8ff 100%);
      color: #2d3748;
      min-height: 100vh;
      padding: 32px 16px;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 22px;
      box-shadow: 0 14px 40px rgba(45, 55, 72, 0.08);
      overflow: hidden;
      border: 1px solid #f1e4ec;
    }
    .hero {
      background: linear-gradient(120deg, #fadadd 0%, #d6ecfa 100%);
      padding: 32px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.85);
      color: #2b6cb0;
      font-weight: 700;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 10px;
    }
    h1 { font-size: 28px; color: #1a202c; margin-bottom: 6px; }
    .subtitle { color: #4a5568; font-size: 15px; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn {
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      transition: transform 0.15s ease;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: #3182ce; color: #fff; }
    .btn-secondary { background: #ffffff; color: #2d3748; border: 1px solid #cbd5e0; }
    .content { padding: 28px 32px 34px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: #fafcff;
      border: 1px solid #e6eef8;
      border-radius: 16px;
      padding: 18px;
    }
    .card h3 { font-size: 15px; color: #2b6cb0; margin-bottom: 10px; }
    .card p, .card li { font-size: 13.5px; line-height: 1.6; color: #4a5568; }
    .card ul { padding-left: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13.5px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #edf2f7; }
    th { background: #f7fafc; color: #2d3748; font-weight: 700; }
    .method {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11.5px;
      min-width: 58px;
      text-align: center;
    }
    .POST { background: #dcfce7; color: #166534; }
    .GET { background: #dbeafe; color: #1e40af; }
    .PUT { background: #fef3c7; color: #92400e; }
    .PATCH { background: #ede9fe; color: #5b21b6; }
    .DELETE { background: #fee2e2; color: #991b1b; }
    .footer {
      text-align: center;
      font-size: 12.5px;
      color: #718096;
      padding: 16px;
      background: #fafafa;
      border-top: 1px solid #edf2f7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div>
        <span class="badge">UTS Web Service Engineering 20261 • Express 5 REST API</span>
        <h1>SIMADU API</h1>
        <p class="subtitle">Sistem Layanan Informasi dan Pengaduan Mahasiswa — UIN Antasari Banjarmasin</p>
      </div>
      <div class="actions">
        <a class="btn btn-primary" href="/api-docs">Buka Swagger UI</a>
        <a class="btn btn-secondary" href="/openapi.json">OpenAPI JSON</a>
      </div>
    </div>
    <div class="content">
      <div class="grid">
        <div class="card">
          <h3>Identitas Mahasiswa</h3>
          <p><strong>Nama:</strong> Erva Aisyana<br/>
          <strong>NIM:</strong> 240104040151<br/>
          <strong>Kelas:</strong> TI24A<br/>
          <strong>Prodi:</strong> Teknologi Informasi<br/>
          <strong>Dosen:</strong> Muhayat, M.IT</p>
        </div>
        <div class="card">
          <h3>Akun Demo Pengujian</h3>
          <ul>
            <li><strong>Mahasiswa 1:</strong> <code>erva.aisyana</code> / <code>Mhs12345!</code></li>
            <li><strong>Mahasiswa 2:</strong> <code>budi.santoso</code> / <code>Mhs67890!</code></li>
            <li><strong>Administrator:</strong> <code>admin.simadu</code> / <code>Admin12345!</code></li>
          </ul>
        </div>
      </div>

      <h3 style="margin-bottom:8px; color:#2d3748;">Daftar Endpoint Utama</h3>
      <table>
        <thead>
          <tr><th>Metode</th><th>Endpoint</th><th>Hak Akses</th><th>Fungsi</th></tr>
        </thead>
        <tbody>
          <tr><td><span class="method POST">POST</span></td><td><code>/api/auth/login</code></td><td>Publik</td><td>Autentikasi pengguna & terbitkan Bearer Token (JWT)</td></tr>
          <tr><td><span class="method GET">GET</span></td><td><code>/api/pengaduan</code></td><td>Mahasiswa / Admin</td><td>Daftar pengaduan (Mahasiswa: sendiri, Admin: semua)</td></tr>
          <tr><td><span class="method GET">GET</span></td><td><code>/api/pengaduan/:id</code></td><td>Mahasiswa / Admin</td><td>Detail pengaduan (cek kepemilikan untuk Mahasiswa)</td></tr>
          <tr><td><span class="method POST">POST</span></td><td><code>/api/pengaduan</code></td><td>Mahasiswa</td><td>Menambahkan pengaduan baru (status awal: diajukan)</td></tr>
          <tr><td><span class="method PUT">PUT</span></td><td><code>/api/pengaduan/:id</code></td><td>Mahasiswa (Pemilik)</td><td>Mengubah judul, kategori, deskripsi (status: diajukan)</td></tr>
          <tr><td><span class="method PATCH">PATCH</span></td><td><code>/api/pengaduan/:id/status</code></td><td>Admin</td><td>Memperbarui status penanganan pengaduan</td></tr>
          <tr><td><span class="method DELETE">DELETE</span></td><td><code>/api/pengaduan/:id</code></td><td>Mahasiswa (Pemilik)</td><td>Menghapus pengaduan (status: diajukan)</td></tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      SIMADU API v1.0.0 • Status Server: Aktif • Dibangun oleh Erva Aisyana (240104040151)
    </div>
  </div>
</body>
</html>`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIMADU API berjalan normal.',
    data: {
      service: 'SIMADU API',
      author: 'Erva Aisyana (240104040151 - TI24A)',
      timestamp: new Date().toISOString(),
    },
  });
});

// 4. Mount API Routes (dengan opsional API Key guard jika diaktifkan di .env)
app.use('/api/auth', optionalApiKeyGuard, authRoutes);
app.use('/api/pengaduan', optionalApiKeyGuard, pengaduanRoutes);

// 5. 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
