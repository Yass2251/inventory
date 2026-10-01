/* =============================================
   INVENTORY BARANG - JAVASCRIPT
   Penyimpanan data memakai localStorage
   ============================================= */

// Kunci localStorage untuk data barang
const STORAGE_KEY = 'inventoryBarang';

// Data contoh (dipakai hanya saat pertama kali dibuka)
const DATA_CONTOH = [
  { id: 1, kode: 'BRG-001', nama: 'Laptop ASUS VivoBook', kategori: 'Elektronik', stok: 12, harga: 7500000 },
  { id: 2, kode: 'BRG-002', nama: 'Mouse Wireless Logitech', kategori: 'Aksesoris', stok: 8, harga: 175000 },
  { id: 3, kode: 'BRG-003', nama: 'Keyboard Mechanical', kategori: 'Aksesoris', stok: 0, harga: 450000 },
  { id: 4, kode: 'BRG-004', nama: 'Printer Canon InkTank', kategori: 'Elektronik', stok: 5, harga: 2350000 },
  { id: 5, kode: 'BRG-005', nama: 'Kertas A4 80gr (rim)', kategori: 'Perlengkapan', stok: 40, harga: 65000 },
  { id: 6, kode: 'BRG-006', nama: 'Pulpen Pilot G2 (lusin)', kategori: 'Perlengkapan', stok: 3, harga: 35000 },
  { id: 7, kode: 'BRG-007', nama: 'Flashdisk 64GB', kategori: 'Aksesoris', stok: 25, harga: 95000 },
  { id: 8, kode: 'BRG-008', nama: 'Kabel HDMI 2 meter', kategori: 'Aksesoris', stok: 2, harga: 45000 }
];

let daftarBarang = [];   // Data barang yang sedang aktif
let idBerikutnya = 1;     // Counter id otomatis


/* ---------- FUNGSI UTAMA ---------- */

// Membaca data dari localStorage (jika kosong, isi dengan data contoh)
function muatData() {
  const simpanan = localStorage.getItem(STORAGE_KEY);

  if (simpanan) {
    daftarBarang = JSON.parse(simpanan);
  } else {
    daftarBarang = [...DATA_CONTOH];
    simpanData();
  }

  // Lanjutkan id setelah id terakhir yang dipakai
  idBerikutnya = daftarBarang.length
    ? Math.max(...daftarBarang.map(b => b.id)) + 1
    : 1;
}

// Menyimpan data ke localStorage
function simpanData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(daftarBarang));
}

// Menentukan label status stok
function statusStok(stok) {
  if (stok > 10) return { teks: 'Tersedia', kelas: 'badge-tersedia' };
  if (stok > 0)  return { teks: 'Stok Menipis', kelas: 'badge-menipis' };
  return { teks: 'Habis', kelas: 'badge-habis' };
}

// Format angka menjadi Rupiah
function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}


/* ---------- TAMPILKAN DATA ---------- */

// Menggambar isi tabel
function tampilkanTabel() {
  tampilkanCard();
  renderTabel(document.getElementById('tableDashboard'), document.getElementById('emptyDashboard'), false);
  renderTabel(document.getElementById('tableBarang'), document.getElementById('emptyBarang'), true);
}

// Mengisi satu tabel dengan data
function renderTabel(tbody, pesanKosong, denganAksi) {
  const kataKunci = (document.getElementById(
    denganAksi ? 'searchBarang' : 'searchDashboard'
  ).value || '').toLowerCase();

  // Filter data berdasarkan nama atau kode barang
  const hasil = daftarBarang.filter(barang => {
    return barang.nama.toLowerCase().includes(kataKunci) ||
           barang.kode.toLowerCase().includes(kataKunci);
  });

  // Kosongkan tabel sebelum diisi ulang
  tbody.innerHTML = '';

  // Tampilkan pesan jika tidak ada data yang cocok
  pesanKosong.hidden = hasil.length > 0;

  hasil.forEach((barang, index) => {
    const status = statusStok(barang.stok);

    const baris = document.createElement('tr');
    baris.innerHTML = `
      <td>${index + 1}</td>
      <td>${barang.kode}</td>
      <td>${barang.nama}</td>
      <td>${barang.kategori}</td>
      <td>${barang.stok}</td>
      <td>${formatRupiah(barang.harga)}</td>
      <td><span class="badge ${status.kelas}">${status.teks}</span></td>
    `;

    // Kolom Aksi hanya ada di halaman Data Barang
    if (denganAksi) {
      const aksi = document.createElement('td');

      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn btn-aksi btn-edit';
      btnEdit.textContent = 'Edit';
      btnEdit.onclick = () => bukaFormEdit(barang.id);

      const btnHapus = document.createElement('button');
      btnHapus.className = 'btn btn-aksi btn-hapus';
      btnHapus.textContent = 'Hapus';
      btnHapus.onclick = () => hapusBarang(barang.id);

      aksi.appendChild(btnEdit);
      aksi.appendChild(btnHapus);
      baris.appendChild(aksi);
    }

    tbody.appendChild(baris);
  });
}

// Menghitung dan menampilkan angka pada dashboard
function tampilkanCard() {
  const tersedia = daftarBarang.filter(b => b.stok > 10).length;
  const menipis = daftarBarang.filter(b => b.stok > 0 && b.stok <= 10).length;

  document.getElementById('totalBarang').textContent = daftarBarang.length;
  document.getElementById('totalTersedia').textContent = tersedia;
  document.getElementById('totalMenipis').textContent = menipis;
}


/* ---------- TAMBAH / EDIT ---------- */

// Membuka form dalam mode tambah
function bukaFormTambah() {
  document.getElementById('modalTitle').textContent = 'Tambah Barang';
  document.getElementById('formBarang').reset();
  document.getElementById('formId').value = '';
  document.getElementById('modalForm').classList.add('show');
}

// Membuka form dalam mode edit dan isi datanya
function bukaFormEdit(id) {
  const barang = daftarBarang.find(b => b.id === id);
  if (!barang) return;

  document.getElementById('modalTitle').textContent = 'Edit Barang';
  document.getElementById('formId').value = barang.id;
  document.getElementById('kode').value = barang.kode;
  document.getElementById('nama').value = barang.nama;
  document.getElementById('kategori').value = barang.kategori;
  document.getElementById('stok').value = barang.stok;
  document.getElementById('harga').value = barang.harga;

  document.getElementById('modalForm').classList.add('show');
}

// Menyimpan data dari form (bisa tambah baru atau mengubah yang lama)
function simpanForm() {
  const id = document.getElementById('formId').value;
  const dataBaru = {
    kode: document.getElementById('kode').value.trim(),
    nama: document.getElementById('nama').value.trim(),
    kategori: document.getElementById('kategori').value.trim(),
    stok: parseInt(document.getElementById('stok').value, 10),
    harga: parseInt(document.getElementById('harga').value, 10)
  };

  // Kode barang tidak boleh sama dengan data lain
  const kodeBentrok = daftarBarang.some(
    b => b.kode.toLowerCase() === dataBaru.kode.toLowerCase() && b.id != id
  );

  if (kodeBentrok) {
    alert('Kode barang sudah dipakai. Gunakan kode lain.');
    return;
  }

  if (id === '') {
    // Tambah barang baru
    dataBaru.id = idBerikutnya++;
    daftarBarang.push(dataBaru);
    alert('Barang berhasil ditambahkan.');
  } else {
    // Ubah barang yang sudah ada
    const barang = daftarBarang.find(b => b.id == id);
    barang.kode = dataBaru.kode;
    barang.nama = dataBaru.nama;
    barang.kategori = dataBaru.kategori;
    barang.stok = dataBaru.stok;
    barang.harga = dataBaru.harga;
    alert('Barang berhasil diperbarui.');
  }

  simpanData();
  tutupForm();
  tampilkanTabel();
}

// Menghapus barang setelah user mengonfirmasi
function hapusBarang(id) {
  const barang = daftarBarang.find(b => b.id === id);
  if (!barang) return;

  const konfirmasi = confirm(`Hapus barang "${barang.nama}"?`);
  if (!konfirmasi) return;

  daftarBarang = daftarBarang.filter(b => b.id !== id);
  simpanData();
  tampilkanTabel();
}

// Menutup jendela form
function tutupForm() {
  document.getElementById('modalForm').classList.remove('show');
}


/* ---------- NAVIGASI SIDEBAR ---------- */

// Pindah halaman Dashboard <-> Data Barang
function pindahHalaman(namaHalaman) {
  document.querySelectorAll('.page').forEach(halaman => {
    halaman.classList.toggle('active', halaman.id === 'page-' + namaHalaman);
  });

  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === namaHalaman);
  });
}


/* ---------- EVENT / INISIALISASI ---------- */

document.addEventListener('DOMContentLoaded', function () {

  muatData();
  tampilkanTabel();

  // Menu sidebar
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => pindahHalaman(item.dataset.page));
  });

  // Pencarian
  document.getElementById('searchDashboard').addEventListener('input', tampilkanTabel);
  document.getElementById('searchBarang').addEventListener('input', tampilkanTabel);

  // Tombol tambah, batal, dan simpan
  document.getElementById('btnTambah').addEventListener('click', bukaFormTambah);
  document.getElementById('btnBatal').addEventListener('click', tutupForm);
  document.getElementById('formBarang').addEventListener('submit', function (event) {
    event.preventDefault();
    simpanForm();
  });
});