require('dotenv').config();
const app = require('./app.cjs');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log('=====================================================');
  console.log('  SIMADU API — Sistem Layanan Informasi & Pengaduan  ');
  console.log('  Mahasiswa : Erva Aisyana (240104040151 / TI24A)    ');
  console.log('=====================================================');
  console.log(`  Server aktif : http://localhost:${PORT}`);
  console.log(`  Swagger UI   : http://localhost:${PORT}/api-docs`);
  console.log(`  OpenAPI JSON : http://localhost:${PORT}/openapi.json`);
  console.log('=====================================================');
});
