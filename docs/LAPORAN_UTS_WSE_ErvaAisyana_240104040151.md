# LAPORAN UJIAN TENGAH SEMESTER (UTS)
## Web Service Engineering — SIMADU API
**Sistem Layanan Informasi dan Pengaduan Mahasiswa**

- **Nama Mahasiswa:** Erva Aisyana
- **NIM:** 240104040151
- **Kelas:** TI24A
- **Program Studi:** Teknologi Informasi
- **Universitas:** Universitas Islam Negeri Antasari Banjarmasin
- **Dosen Pengampu:** Muhayat, M.IT
- **Tanggal UTS:** Kamis, 19 November 2026

---

## SOAL 1 — Analisis Kebutuhan dan Perancangan REST API (15 Poin)

### 1.1 Identifikasi Aktor
1. **Mahasiswa**: Pengguna terautentikasi dengan role `mahasiswa` yang dapat mengajukan pengaduan baru, melihat daftar dan detail pengaduan miliknya sendiri, serta mengubah atau menghapus pengaduannya sendiri selama status masih `diajukan`.
2. **Administrator**: Pengguna terautentikasi dengan role `admin` yang dapat melihat seluruh pengaduan dari semua mahasiswa dan memperbarui status penanganan (`diajukan`, `diproses`, `selesai`) tanpa dapat mengubah identitas pemilik (`mahasiswaId`).

### 1.2 Resource Utama
- **`auth`**: Mengelola autentikasi pengguna dan penerbitan token akses (`POST /api/auth/login`).
- **`pengaduan`**: Resource inti sistem yang menyimpan data pengaduan mahasiswa dengan atribut `id`, `mahasiswaId`, `judul`, `kategori` (`Fasilitas`, `Akademik`, `TI`), `deskripsi`, `status` (`diajukan`, `diproses`, `selesai`), dan `createdAt` (ISO 8601).

### 1.3 Tabel Kontrak Endpoint

| No | Metode | Endpoint | Hak Akses | Request Body (Ringkas) | Status Berhasil | Status Gagal |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/auth/login` | Publik | `{ username, password }` | `200 OK` | `400`, `401`, `500` |
| 2 | `GET` | `/api/pengaduan` | Mahasiswa / Admin | Query opsional: `?kategori=&status=` | `200 OK` | `400`, `401`, `500` |
| 3 | `GET` | `/api/pengaduan/:id` | Mahasiswa (pemilik) / Admin | Path param: `id` (integer) | `200 OK` | `400`, `401`, `403`, `404` |
| 4 | `POST` | `/api/pengaduan` | Mahasiswa | `{ judul, kategori, deskripsi }` | `201 Created` | `400`, `401`, `403`, `500` |
| 5 | `PUT` | `/api/pengaduan/:id` | Mahasiswa (pemilik, status `diajukan`) | `{ judul, kategori, deskripsi }` | `200 OK` | `400`, `401`, `403`, `404` |
| 6 | `PATCH` | `/api/pengaduan/:id/status` | Admin | `{ status }` | `200 OK` | `400`, `401`, `403`, `404` |
| 7 | `DELETE` | `/api/pengaduan/:id` | Mahasiswa (pemilik, status `diajukan`) | - | `200 OK` | `400`, `401`, `403`, `404` |

### 1.4 Struktur JSON Request & Response Konsisten
- **Contoh Request `POST /api/pengaduan`:**
  ```json
  {
    "judul": "WiFi Perpustakaan Lantai 2 Sering Terputus",
    "kategori": "TI",
    "deskripsi": "Koneksi WiFi kampus di area baca lantai 2 sering disconnect saat mengakses jurnal online."
  }
  ```
- **Contoh Response Sukses (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Pengaduan berhasil dibuat.",
    "data": {
      "id": 4,
      "mahasiswaId": "240104040151",
      "judul": "WiFi Perpustakaan Lantai 2 Sering Terputus",
      "kategori": "TI",
      "deskripsi": "Koneksi WiFi kampus di area baca lantai 2 sering disconnect saat mengakses jurnal online.",
      "status": "diajukan",
      "createdAt": "2026-11-24T12:00:00.000Z"
    }
  }
  ```
- **Contoh Response Gagal (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN_OWNERSHIP",
      "message": "Akses ditolak. Anda hanya diperbolehkan melihat pengaduan milik sendiri."
    }
  }
  ```

### 1.5 Alur Komunikasi Consumer–Provider & Diagram Arsitektur

```text
+-----------------------+        HTTP/HTTPS + JSON        +---------------------------------------------+
|  Service Consumers    |  (Authorization: Bearer <JWT>)  |            SIMADU REST API (Express 5)      |
|  - Aplikasi Web       | ------------------------------> |                                             |
|  - Aplikasi Mobile    | <------------------------------ |  1. Security & Sanitized Logger Middleware  |
|  - Swagger / Postman  |        JSON + HTTP Status       |  2. Routes (/api/auth, /api/pengaduan)      |
+-----------------------+                                 |  3. Auth (JWT) & Authorize (RBAC) Middleware|
                                                          |  4. Strict Validation Middleware            |
                                                          |  5. Controllers (HTTP Handler)              |
                                                          |  6. Services (Business Rules & Ownership)   |
                                                          |  7. Repositories (Data Access Layer)        |
                                                          |  8. Global Error Handler (400/401/403/404)  |
                                                          +---------------------------------------------+
```

---

## SOAL 2 & SOAL 3 — Implementasi REST API & Keamanan (50 Poin)

1. **Teknologi & Arsitektur Berlapis**: Dibangun menggunakan Node.js dan **Express 5** dengan pemisahan ketat antara `routes`, `middleware`, `controllers`, `services`, dan `repositories`.
2. **Integritas Data Pemilik**: Pada `POST /api/pengaduan`, `id`, `mahasiswaId`, `status` (`diajukan`), dan `createdAt` ditetapkan sepenuhnya oleh server (`pengaduan.service.cjs` & `pengaduan.repository.cjs`). Jika client menyisipkan field tersebut, `validate.middleware.cjs` menolaknya dengan status `400 Bad Request`.
3. **Password Hashing**: Password tidak pernah disimpan dalam plaintext. Sistem menggunakan algoritma **Scrypt** dengan salt acak 16-byte per pengguna dan verifikasi `crypto.timingSafeEqual` di `src/utils/password.cjs`.
4. **Bearer Token (JWT) dengan Kedaluwarsa**: Setiap login menghasilkan JWT unik yang memuat `sub`, `username`, `nama`, `role`, serta `exp` (default `1h` dari `.env`). Token diverifikasi di `src/middleware/auth.middleware.cjs`.
5. **Otorisasi Multi-Lapis**:
   - **RBAC**: `authorizeRoles(...)` membatasi endpoint sesuai matriks hak akses.
   - **Ownership Check**: `pengaduan.service.cjs` memastikan `existing.mahasiswaId === currentUser.id`.
   - **Status Policy**: Perubahan (`PUT`) dan penghapusan (`DELETE`) oleh mahasiswa hanya diizinkan jika `existing.status === 'diajukan'`.
6. **Keamanan Tambahan**: Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), sanitized request logger (`Auth:[REDACTED]`), serta opsional `x-api-key` guard (`ENABLE_API_KEY` di `.env`).

---

## SOAL 4 — Hasil Pengujian Fungsional dan Keamanan (15 Poin)

Pengujian dijalankan menggunakan `npm test` (`tests/run-tests.cjs`), Postman (`tests/SIMADU_API.postman_collection.json`), dan Swagger UI (`/api-docs`).

| No | Skenario Pengujian | Expected | Actual | Status |
| :-: | :--- | :---: | :---: | :---: |
| 1 | Login dengan kredensial benar (`erva.aisyana`) | `200` + token | `200` + JWT diterima | LULUS |
| 2 | Login dengan password salah | `401` | `401 INVALID_CREDENTIALS` | LULUS |
| 3 | Akses endpoint terlindungi tanpa token | `401` | `401 TOKEN_MISSING` | LULUS |
| 4 | Akses menggunakan token tidak valid | `401` | `401 TOKEN_INVALID` | LULUS |
| 5 | Mahasiswa membuat pengaduan valid | `201` | `201` (`mahasiswaId` otomatis) | LULUS |
| 6 | Mahasiswa membaca pengaduan sendiri (`ID 1`) | `200` | `200 OK` | LULUS |
| 7 | Mahasiswa mencoba membaca pengaduan orang lain (`ID 3`) | `403` | `403 FORBIDDEN_OWNERSHIP` | LULUS |
| 8 | Mahasiswa mengubah status pengaduan | `403` | `403 FORBIDDEN_ROLE` | LULUS |
| 9 | Admin melihat seluruh pengaduan | `200` | `200 OK` (semua data) | LULUS |
| 10 | Admin memperbarui status pengaduan (`ID 1` -> `diproses`) | `200` | `200 OK` (`mahasiswaId` tetap) | LULUS |
| 11 | Membuat pengaduan dengan field wajib kosong | `400` | `400 VALIDATION_ERROR` | LULUS |
| 12 | Mengakses ID pengaduan yang tidak ditemukan (`ID 9999`) | `404` | `404 PENGADUAN_NOT_FOUND` | LULUS |
| 13 | *(Bonus)* Mahasiswa mengubah pengaduan sendiri (`diajukan`) | `200` | `200 OK` | LULUS |
| 14 | *(Bonus)* Tolak field terlarang (`mahasiswaId`, `status`) | `400` | `400 FORBIDDEN_FIELDS` | LULUS |
| 15 | *(Bonus)* Mahasiswa hapus pengaduan status `diproses` (`ID 2`) | `403` | `403 STATUS_LOCKED` | LULUS |
| 16 | *(Bonus)* Mahasiswa hapus pengaduan sendiri (`diajukan`) | `200` | `200 OK` | LULUS |

*(Catatan: Jalankan `npm test` dan lampirkan screenshot hasil Postman/Swagger pada file HTML sebelum ekspor ke PDF).*

---

## SOAL 5 — Dokumentasi & Pembagian Tanggung Jawab Kode (20 Poin)

- **OpenAPI & Swagger UI**: Tersedia di `docs/openapi.json` dan dapat diakses secara interaktif melalui `http://localhost:3000/api-docs`.
- **README.md**: Memuat prasyarat, instalasi, konfigurasi `.env`, daftar akun demo, kontrak endpoint, dan panduan pengujian.
- **Pembagian Lapisan**:
  - `routes`: Pemetaan URL & rantai middleware.
  - `middleware`: Autentikasi, otorisasi, validasi, header keamanan, error handling.
  - `controllers`: Jembatan HTTP request/response ke service.
  - `services`: Aturan bisnis inti (kepemilikan data, status terkunci, login).
  - `repositories`: Pengelolaan penyimpanan data pengguna dan pengaduan.

---

## BAGIAN F — Jawaban 10 Pertanyaan Demonstrasi UTS

### 1. Apa perbedaan autentikasi dan otorisasi? Tunjukkan implementasinya di dalam kode.
- **Autentikasi (Authentication)** adalah proses memverifikasi *siapa* pengguna yang mengakses sistem.
  - *Implementasi kode*: Proses login pada `src/services/auth.service.cjs` (memverifikasi `username` dan `password` terhadap hash Scrypt, lalu menerbitkan JWT) serta `authenticateBearer` pada `src/middleware/auth.middleware.cjs` (memverifikasi keabsahan dan masa berlaku Bearer Token pada setiap request).
- **Otorisasi (Authorization)** adalah proses menentukan *apa yang boleh dilakukan* oleh pengguna yang sudah terautentikasi tersebut.
  - *Implementasi kode*: Middleware `authorizeRoles(...)` pada `src/middleware/authorize.middleware.cjs` (memeriksa role `mahasiswa` vs `admin`) serta pengecekan kepemilikan data (`existing.mahasiswaId !== currentUser.id`) dan status (`existing.status !== 'diajukan'`) pada `src/services/pengaduan.service.cjs`.

### 2. Mengapa mahasiswa yang berhasil login belum tentu boleh mengakses semua endpoint?
Karena keberhasilan login hanya membuktikan **identitas** pengguna (autentikasi), bukan memberikan hak akses penuh ke seluruh sistem. Sesuai prinsip **Least Privilege** (hak akses minimum) dan matriks kebijakan SIMADU, mahasiswa hanya berwenang mengelola pengaduannya sendiri, tidak boleh melihat pengaduan mahasiswa lain (menjaga privasi data), dan tidak boleh mengubah status penanganan yang merupakan wewenang khusus Administrator.

### 3. Apa perbedaan respons HTTP 401 dan 403?
- **401 Unauthorized (Unauthenticated)**: Identitas client belum diketahui atau tidak sah—misalnya tidak menyertakan header `Authorization: Bearer <token>`, token palsu/rusak, token kedaluwarsa, atau username/password salah saat login.
- **403 Forbidden**: Identitas client **sudah berhasil diverifikasi** (token sah), tetapi pengguna tersebut **tidak memiliki izin** untuk melakukan aksi atau mengakses resource yang diminta—misalnya mahasiswa mencoba mengubah status pengaduan (`PATCH /api/pengaduan/:id/status`) atau membaca pengaduan milik mahasiswa lain.

### 4. Bagaimana API memastikan seorang mahasiswa hanya dapat mengubah pengaduannya sendiri?
Melalui tiga lapis perlindungan:
1. Identitas pemilik (`mahasiswaId`) tidak diambil dari body request client, melainkan dari `req.user.id` hasil dekode JWT yang ditandatangani server (`auth.middleware.cjs`).
2. Middleware `validatePengaduanPayload` menolak request jika client mencoba menyisipkan field `mahasiswaId` secara paksa.
3. Pada fungsi `updatePengaduan` di `src/services/pengaduan.service.cjs`, server membandingkan `existing.mahasiswaId !== currentUser.id`. Jika berbeda, sistem langsung melempar `AppError` dengan status `403 Forbidden`, dan hanya mengizinkan perubahan jika `existing.status === 'diajukan'`.

### 5. Mengapa password harus di-hash dan mengapa token tidak boleh dicatat ke log?
- **Password harus di-hash (dengan salt)**: Karena hashing bersifat satu arah (*one-way*). Jika terjadi kebocoran basis data atau repositori, penyerang tidak dapat membaca password asli pengguna. Penggunaan *salt* unik per pengguna juga mencegah serangan *rainbow table*.
- **Token tidak boleh dicatat ke log**: Bearer Token berfungsi layaknya kunci akses sementara yang siap pakai. Jika token tertulis di file log server atau console, siapa pun yang memiliki akses baca ke log (atau jika log bocor) dapat melakukan *session hijacking* dan menyamar sebagai pengguna tersebut selama token belum kedaluwarsa. Oleh karena itu, `sanitizedRequestLogger` di `src/middleware/security.middleware.cjs` menyamarkannya sebagai `Auth:[REDACTED]`.

### 6. Bagaimana sebuah input yang salah ditangani oleh middleware dan error handler?
1. Jika JSON rusak (*malformed*), `express.json()` melempar `SyntaxError` yang langsung ditangkap oleh `globalErrorHandler` di `src/middleware/error.middleware.cjs` dan dikembalikan sebagai `400 INVALID_JSON`.
2. Jika JSON valid namun field kosong, tipe data salah, kategori/status tidak sesuai daftar, atau ada field terlarang (`mahasiswaId`, `id`, `status`), middleware di `src/middleware/validate.middleware.cjs` menghentikan eksekusi sebelum mencapai controller/service dengan memanggil `next(new AppError(..., 400, ...))`.
3. `globalErrorHandler` memformat error menjadi respons JSON seragam (`success: false`) tanpa membocorkan *stack trace* atau detail internal server.

### 7. Apa perbedaan HTTPS dengan autentikasi Bearer Token?
- **HTTPS (TLS)** mengamankan **jalur komunikasi (transport layer)** antara client dan server dengan enkripsi, mencegah penyadapan (*eavesdropping*) dan modifikasi data di jaringan (*Man-in-the-Middle*).
- **Bearer Token (JWT)** mengamankan **lapisan aplikasi (application layer)** untuk membuktikan identitas dan klaim pengguna pada setiap permintaan API.
- Keduanya saling melengkapi: tanpa HTTPS, Bearer Token yang dikirim melalui header HTTP dapat disadap di jaringan; sebaliknya, tanpa Bearer Token, HTTPS tidak mengetahui siapa pengguna yang sedang mengakses endpoint.

### 8. Bagaimana membuktikan bahwa input yang ditolak tidak mengubah data?
Dengan melakukan verifikasi *state* sebelum dan sesudah permintaan yang ditolak:
1. Catat data awal menggunakan `GET /api/pengaduan` atau `GET /api/pengaduan/:id`.
2. Kirim permintaan ilegal (misalnya `POST` dengan field kosong -> `400`, `PUT` oleh bukan pemilik -> `403`, atau `DELETE` pada status `diproses` -> `403`).
3. Panggil kembali `GET /api/pengaduan` / `GET /api/pengaduan/:id` dan pastikan jumlah data serta seluruh nilai field (`judul`, `kategori`, `deskripsi`, `status`, `mahasiswaId`) tetap identik karena eksekusi telah dihentikan pada middleware validasi atau lapisan service sebelum menyentuh `pengaduan.repository.cjs`.

### 9. Mengapa dokumentasi Swagger yang tampil belum cukup membuktikan API berjalan dengan benar?
Karena Swagger UI hanya merender spesifikasi statis dari file `docs/openapi.json` (kontrak di atas kertas). File OpenAPI bisa saja terlihat rapi dan lengkap meskipun implementasi kode di server belum sesuai kontrak, memiliki bug logika otorisasi, salah mengembalikan status code, atau gagal menolak input berbahaya. Oleh karena itu, pembuktian kebenaran API tetap wajib dilakukan melalui pengujian aktual (fungsional dan keamanan, baik skenario sukses maupun skenario penolakan) menggunakan Postman, REST Client, atau automated test (`npm test`).

### 10. Apa yang harus diperbaiki agar layanan ini layak diterapkan pada lingkungan produksi?
1. **Basis Data Persisten**: Mengganti penyimpanan *in-memory* array dengan database persisten (seperti PostgreSQL/MySQL) dilengkapi migrasi, indeks, dan *parameterized query*.
2. **HTTPS/TLS Wajib & Secret Management**: Menjalankan layanan di belakang reverse proxy (Nginx/Cloudflare) dengan sertifikat TLS valid serta menyimpan `JWT_SECRET` di *secret manager*, bukan file lokal.
3. **Manajemen Token Lanjutan**: Menambahkan *refresh token*, *token revocation/blacklist* (misal via Redis) saat logout, serta *rate limiting* (`express-rate-limit`) pada endpoint `/api/auth/login` untuk mencegah serangan *brute-force*.
4. **Konfigurasi CORS Ketat & Helmet**: Membatasi *origin* CORS hanya ke domain aplikasi Web/Mobile resmi.
5. **Observabilitas & Audit Trail**: Logging terstruktur (Winston/Pino) tanpa data sensitif, pencatatan riwayat perubahan status pengaduan (*audit log*), serta *monitoring* kesehatan server dan CI/CD automated testing.
