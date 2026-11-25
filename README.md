# SIMADU API — Sistem Layanan Informasi dan Pengaduan Mahasiswa

**Ujian Tengah Semester (UTS) Web Service Engineering (20261)**  
Program Studi Teknologi Informasi — Universitas Islam Negeri Antasari Banjarmasin

| Identitas | Keterangan |
| :--- | :--- |
| **Nama Mahasiswa** | Erva Aisyana |
| **NIM** | 240104040151 |
| **Kelas** | TI24A |
| **Mata Kuliah** | Web Service Engineering (3 SKS) |
| **Dosen Pengampu** | Muhayat, M.IT |
| **Teknologi** | Node.js, Express 5, JSON, JWT, Scrypt, OpenAPI 3.0 & Swagger UI |

---

## 1. Gambaran Umum Proyek

**SIMADU API** adalah layanan *backend* berbasis **REST API berlapis** untuk mengelola pengaduan mahasiswa terkait **Fasilitas**, **Akademik**, dan **Teknologi Informasi (TI)**. API ini dirancang agar dapat dikonsumsi secara terintegrasi oleh aplikasi **Web** maupun **Mobile** dengan menerapkan autentikasi Bearer Token (JWT), otorisasi berbasis *role* & kepemilikan data, validasi input ketat, serta dokumentasi interaktif OpenAPI/Swagger UI.

---

## 2. Prasyarat & Instalasi (Siap Pakai di VS Code)

### Prasyarat
- **Node.js** versi `18.x` atau lebih baru (teruji hingga Node.js `v24.x`)
- **npm** (otomatis terpasang bersama Node.js)
- **Visual Studio Code** (disarankan memasang ekstensi *REST Client* atau *Postman*)

### Langkah Instalasi & Menjalankan Server
1. Ekstrak folder `simadu-api` lalu buka di **Visual Studio Code**.
2. Buka Terminal di VS Code (`Ctrl + `` `), lalu jalankan:
   ```bash
   npm install
   ```
3. Salin file konfigurasi lingkungan `.env.example` menjadi `.env`:
   - **Windows PowerShell:**
     ```powershell
     Copy-Item .env.example .env
     ```
   - **Linux / macOS / Git Bash:**
     ```bash
     cp .env.example .env
     ```
4. Jalankan server:
   ```bash
   npm start
   ```
   *(Atau `npm run dev` untuk mode pengembangan dengan auto-reload).*
5. Akses layanan di browser:
   - **Landing Page & Ringkasan API:** `http://localhost:3000/`
   - **Swagger UI (Dokumentasi Interaktif):** `http://localhost:3000/api-docs`
   - **Spesifikasi OpenAPI JSON:** `http://localhost:3000/openapi.json`
   - **Health Check:** `http://localhost:3000/api/health`

---

## 3. Akun Demo Pengujian (Data Uji Awal)

Data uji awal mencakup **2 Mahasiswa** dan **1 Administrator** untuk menguji autentikasi, RBAC, dan kepemilikan data. Seluruh password disimpan dalam bentuk **salted hash (Scrypt)** di `src/repositories/user.repository.cjs`, bukan plaintext.

| Peran | Username | Password | ID / NIM |
| :--- | :--- | :--- | :--- |
| **Mahasiswa 1** | `erva.aisyana` | `Mhs12345!` | `240104040151` |
| **Mahasiswa 2** | `budi.santoso` | `Mhs67890!` | `240104040199` |
| **Administrator** | `admin.simadu` | `Admin12345!` | `ADM-001` |

---

## 4. Kontrak Endpoint & Matriks Hak Akses

| Metode | Endpoint | Mahasiswa | Admin | Keterangan |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/login` | Publik | Publik | Autentikasi & terbitkan JWT Bearer Token |
| `GET` | `/api/pengaduan` | Milik sendiri | Semua | Daftar pengaduan (mendukung filter `?kategori=&status=`) |
| `GET` | `/api/pengaduan/:id` | Milik sendiri | Semua | Detail pengaduan (`403` jika mahasiswa akses milik orang lain) |
| `POST` | `/api/pengaduan` | Ya | Tidak (`403`) | Tambah pengaduan (`id`, `mahasiswaId`, `status='diajukan'` otomatis) |
| `PUT` | `/api/pengaduan/:id` | Pemilik & `diajukan` | Tidak (`403`) | Ubah `judul`, `kategori`, `deskripsi` |
| `PATCH` | `/api/pengaduan/:id/status` | Tidak (`403`) | Ya | Perbarui `status` (`diajukan`, `diproses`, `selesai`) |
| `DELETE` | `/api/pengaduan/:id` | Pemilik & `diajukan` | Tidak (`403`) | Hapus pengaduan sesuai kebijakan akses |

### Format Respons Konsisten
- **Berhasil:**
  ```json
  {
    "success": true,
    "message": "Pengaduan berhasil dibuat.",
    "data": { ... }
  }
  ```
- **Gagal (`400`, `401`, `403`, `404`, `500`):**
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN_OWNERSHIP",
      "message": "Akses ditolak. Anda hanya diperbolehkan melihat pengaduan milik sendiri."
    }
  }
  ```

---

## 5. Struktur Proyek & Pembagian Tanggung Jawab (Layered Architecture)

```text
simadu-api/
├── src/
│   ├── routes/         # Pemetaan URL, metode HTTP, dan urutan middleware ke controller
│   ├── middleware/     # Autentikasi JWT, otorisasi role, validasi input, header keamanan, error handler
│   ├── controllers/    # Menangani HTTP req/res, memanggil service, memformat respons JSON
│   ├── services/       # Aturan bisnis (cek kepemilikan, kunci status 'diajukan', penerbitan token)
│   ├── repositories/   # Abstraksi akses penyimpanan data (in-memory store pengguna & pengaduan)
│   └── utils/          # Helper AppError, response formatter, dan Scrypt password hashing
├── docs/
│   ├── openapi.json                                   # Spesifikasi OpenAPI 3.0.3
│   ├── LAPORAN_UTS_WSE_ErvaAisyana_240104040151.md    # Laporan UTS lengkap (Markdown)
│   └── LAPORAN_UTS_WSE_ErvaAisyana_240104040151.html  # Laporan UTS siap cetak PDF (Ctrl+P -> Save as PDF)
├── tests/
│   ├── SIMADU_API.postman_collection.json             # Koleksi Postman 16 skenario
│   ├── simadu.http                                    # Pengujian langsung di VS Code REST Client
│   └── run-tests.cjs                                  # Pengujian otomatis (npm test)
├── app.cjs             # Konfigurasi aplikasi Express 5, Swagger UI, dan global middleware
├── server.cjs          # Entry point untuk menjalankan HTTP server
├── package.json        # Dependensi dan skrip npm
├── .env.example        # Contoh konfigurasi environment
└── .gitignore          # Daftar file yang diabaikan Git
```

### Ringkasan Peran Setiap Lapisan
1. **Router (`src/routes/`)**: Mendefinisikan jalur endpoint (`/api/auth`, `/api/pengaduan`) serta merangkai middleware keamanan dan validasi sebelum masuk ke controller.
2. **Middleware (`src/middleware/`)**: Berfungsi sebagai gerbang pengaman berlapis—memverifikasi Bearer Token (`auth.middleware.cjs`), mengecek role (`authorize.middleware.cjs`), memvalidasi payload & menolak field terlarang (`validate.middleware.cjs`), menyamarkan token di log (`security.middleware.cjs`), dan menangani error secara terpusat (`error.middleware.cjs`).
3. **Controller (`src/controllers/`)**: Menerima data yang sudah tervalidasi dari `req`, meneruskannya ke lapisan `service`, lalu mengembalikan respons HTTP dengan status code yang sesuai.
4. **Service (`src/services/`)**: Menyimpan inti logika bisnis, seperti verifikasi kredensial, penerbitan JWT, pembatasan akses kepemilikan (`mahasiswaId === req.user.id`), serta kebijakan pengubahan/penghapusan hanya saat status `diajukan`.
5. **Repository (`src/repositories/`)**: Mengelola baca/tulis data pengguna dan pengaduan secara terisolasi agar mudah diganti ke database relasional/NoSQL (misal PostgreSQL/MongoDB) tanpa mengubah controller maupun service.

---

## 6. Cara Menjalankan Pengujian (12 Skenario Wajib + 4 Bonus)

1. **Pengujian Otomatis via Terminal (Tercepat):**
   ```bash
   npm test
   ```
   Script `tests/run-tests.cjs` akan menjalankan seluruh **16 skenario** (12 wajib + 4 bonus keamanan) dan menyimpan bukti respons aktual ke `docs/hasil-pengujian-aktual.json`.
2. **Pengujian via Postman:**
   Import file `tests/SIMADU_API.postman_collection.json` ke Postman, pastikan server aktif (`npm start`), lalu jalankan request secara berurutan (token otomatis tersimpan ke *collection variable*).
3. **Pengujian via VS Code REST Client:**
   Buka file `tests/simadu.http` di VS Code (dengan ekstensi *REST Client*), lalu klik **Send Request** di atas setiap skenario.
4. **Pengujian via Swagger UI:**
   Buka `http://localhost:3000/api-docs`, login melalui `POST /api/auth/login`, klik **Authorize**, lalu uji seluruh endpoint.
