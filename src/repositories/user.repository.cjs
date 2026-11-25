/**
 * Repository Pengguna (In-Memory)
 * Password disimpan dalam bentuk salted hash (Scrypt), BUKAN plaintext.
 * Data uji awal mencakup 2 Mahasiswa dan 1 Administrator untuk pengujian
 * autentikasi, RBAC, dan kepemilikan data (ownership).
 */
const users = [
  {
    id: '240104040151',
    username: 'erva.aisyana',
    nama: 'Erva Aisyana',
    nim: '240104040151',
    kelas: 'TI24A',
    role: 'mahasiswa',
    passwordHash: '7f3a9c12e4b80d61a5f2c89e3410b7d2:d362acf11e2f8c322846a39bed13e8b41aa154031469cbfbab9ea758317a7d29f820bebb820d5117a8e0771ef80329b5bfeb720318b42aaa8484c0792d3cc216',
  },
  {
    id: '240104040199',
    username: 'budi.santoso',
    nama: 'Budi Santoso',
    nim: '240104040199',
    kelas: 'TI24A',
    role: 'mahasiswa',
    passwordHash: 'c4e18b7390a25f1d6e84b2093a7c51f8:46623af6904dce5861e2eac0ebcc03f14d5d498cf084bbfc11df7514a723476e03079d19b5d65c67f92270323a27732c29c7e9aa725dc9fe01ff72e648aa6dc4',
  },
  {
    id: 'ADM-001',
    username: 'admin.simadu',
    nama: 'Administrator Layanan Kampus',
    nim: null,
    kelas: null,
    role: 'admin',
    passwordHash: '91d4f6a82c0e73b5d8194a6f2e0c83b1:f7ef262f5323fb3c8acfba3b41fdd9cda260e2f236f0c2a6bea15f09a80fdd9915f9e0a17861a7b4d1711c3aa299b60c554ed31ddd9b9258b4fdba66b750aca4',
  },
];

function findByUsername(username) {
  return users.find((user) => user.username === username) || null;
}

function findById(id) {
  return users.find((user) => user.id === id) || null;
}

module.exports = {
  findByUsername,
  findById,
};
