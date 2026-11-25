<div align="center">
  <img src="src/app/icon.svg" alt="Logo Perpustakaan Cendekia" width="240" height="240" />

  <h1>Perpustakaan Cendekia</h1>
  <p><strong>Ilmu Terhimpun, Cendekia Berkembang.</strong></p>
  <p>
    Sistem informasi manajemen perpustakaan berbasis web untuk pencarian katalog, peminjaman buku,
    antrean reservasi otomatis, pengelolaan denda, dan layanan terpadu.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-App%20Router-0A1172?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-JavaScript-1E3A8A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS" />
  </p>
</div>

---

## Daftar Isi

1. [Tentang Perpustakaan Cendekia](#tentang-perpustakaan-cendekia)
2. [Fitur Utama Sistem](#fitur-utama-sistem)
3. [Alur Sirkulasi](#alur-sirkulasi)
4. [Tingkat Pengguna](#tingkat-pengguna)
5. [Teknologi](#teknologi)
6. [Identitas Visual](#identitas-visual)
7. [Struktur Direktori](#struktur-direktori)
8. [Instalasi](#instalasi)
9. [Akun Demo](#akun-demo)
10. [Pengujian](#pengujian)
11. [Status Pengembangan](#status-pengembangan)
12. [Catatan Keamanan](#catatan-keamanan)
13. [Referensi Proyek](#referensi-proyek)

---

## Tentang Perpustakaan Cendekia

**Perpustakaan Cendekia** adalah web manajemen perpustakaan *full-stack* yang dirancang untuk menghubungkan peminjam (mahasiswa maupun pengunjung umum) dengan petugas Meja Layanan secara terpadu. Pengguna dapat menelusuri koleksi buku, mengajukan peminjaman secara daring sebelum mengambil buku fisik di perpustakaan, masuk ke antrean reservasi ketika stok habis, serta memantau tenggat pengembalian dan rincian denda dalam satu dasbor.

Sistem ini dibangun menggunakan **Next.js App Router** dengan **Server Components** dan **Server Actions**, terhubung langsung ke basis data relasional **PostgreSQL** dengan penguncian transaksi (`FOR UPDATE`) serta acuan waktu terpusat **WITA (`Asia/Makassar`)** untuk menjaga konsistensi stok eksemplar, riwayat sirkulasi, dan status antrean.

---

## Fitur Utama Sistem

### 1. Eksplorasi Katalog & Beranda Publik
- **Podium 5 Buku Terpopuler:** Menampilkan 5 buku dengan frekuensi peminjaman tertinggi dalam tata letak podium bertingkat (`#1` hingga `#5`).
- **Pencarian & Filter Katalog:** Pencarian berdasarkan judul buku, ISBN, atau nama pengarang yang dipadukan dengan filter kategori, ketersediaan, pengurutan, dan paginasi.
- **Detail Buku Komprehensif:** Menampilkan sampul buku secara utuh tanpa terpotong, metadata (ISBN, penerbit, tahun terbit, kategori), ketersediaan stok eksemplar, batas lama pinjam, tarif denda harian, rating bintang, dan ulasan pembaca.
- **Papan Pengumuman Terkategorisasi:** Informasi resmi perpustakaan yang dikelompokkan ke dalam kategori **Acara**, **Operasional**, dan **Koleksi**, serta otomatis tayang sesuai jadwal tanggal rilis.

### 2. Sirkulasi Peminjaman & Reservasi Otomatis (FIFO)
- **Pengajuan Pinjam:** Peminjam mengajukan peminjaman dari halaman detail buku (maksimal 3 pinjaman aktif) sebelum diverifikasi pegawai di Meja Layanan.
- **Antrean Reservasi Otomatis:** Ketika stok tersedia bernilai `0`, peminjam dapat masuk ke antrean reservasi. Saat buku dikembalikan, sistem otomatis mengunci stok untuk pengantre urutan pertama dengan batas ambil 2 hari dan mengirimkan notifikasi.
- **Pembersihan Reservasi Kedaluwarsa:** Pengecekan otomatis (`sweepExpiredReservations`) yang meneruskan hak ambil buku ke pengantre berikutnya apabila batas waktu pengambilan terlewati.
- **Perpanjangan, Denda & Pemblokiran Otomatis:** Pengajuan perpanjangan masa pinjam maksimal 1 kali per transaksi, kalkulasi denda keterlambatan harian otomatis saat pengembalian, serta pemblokiran pengajuan baru selama masih ada denda tertunggak atau buku melewati jatuh tempo.

### 3. Notifikasi & Ulasan Pembaca
- **Pusat Notifikasi Peminjam:** Pengingat otomatis H-1 mendekati jatuh tempo, pemberitahuan denda baru, keputusan pengajuan pinjam/perpanjangan, serta informasi buku reservasi yang siap diambil.
- **Rating & Ulasan Terverifikasi:** Pembaca hanya dapat memberikan rating (1–5 bintang) dan ulasan setelah menyelesaikan proses peminjaman buku terkait.

### 4. Manajemen Data Master, Monitoring & Laporan
- **Kelola Koleksi & Pengumuman:** Pengelolaan data buku, sampul buku, stok eksemplar, kategori buku, dan publikasi pengumuman oleh Admin maupun Pegawai.
- **Filter Otomatis (*Auto-Render*):** Pencarian *debounced* dan filter langsung tanpa tombol terapkan pada halaman Manajemen Pengguna, Kelola Buku, Kelola Pengumuman, dan Monitoring Transaksi.
- **Manajemen Akun Pengguna:** Pengaturan data akun dan status keaktifan anggota oleh Administrator dengan kebijakan **Single Admin** (hanya satu akun Admin utama di dalam sistem).
- **Monitoring Transaksi & Laporan CSV:** Pemantauan seluruh log sirkulasi dan denda oleh Admin beserta unduhan laporan dalam format **CSV** (`UTF-8 BOM`).

---

## Alur Sirkulasi

### Alur Peminjaman Normal

```text
[Cari Buku di Katalog]
         │
         ▼
[Ajukan Pinjam] ──► Status Pinjaman: "Menunggu Konfirmasi"
         │
         ▼
[Verifikasi Pegawai di Meja Layanan] ──► Status Pinjaman: "Sedang Dipinjam" (Stok berkurang 1)
         │
         ├──► (Opsional) [Ajukan Perpanjangan] ──► Status Perpanjangan: "Diajukan"
         │
         ▼
[Pengembalian Buku]
         ├──► Tepat Waktu ──► Status Pinjaman: "Selesai"
         └──► Terlambat   ──► Status Pinjaman: "Selesai" + Denda "Tertunggak" ──► Bayar ──► "Lunas"
```

### Alur Antrean Reservasi (Saat Stok Habis)

```text
[Stok Buku = 0] ──► Peminjam klik "Reservasi (masuk antrean)" ──► Status: "Menunggu"
                                                                          │
[Buku Dikembalikan Peminjam Sebelumnya] ◄─────────────────────────────────┘
         │
         ▼
[Sistem Mengunci Stok untuk Antrean #1] ──► Status: "Siap Diambil" + Kirim Notifikasi
         │
         ├──► Diambil sebelum tenggat (2 hari) ──► Klik "Ajukan Pinjam" ──► Masuk Alur Peminjaman
         └──► Melewati batas waktu            ──► Status: "Kedaluwarsa" ──► Dialihkan ke Antrean #2
```

---

## Tingkat Pengguna

Sistem menerapkan kontrol akses berbasis peran (*Role-Based Access Control*) ke dalam 4 tingkat pengguna utama (ditambah pengunjung tamu tanpa login):

| Peran | Kode Role | Rute Dasbor | Hak Akses & Wewenang |
| :--- | :--- | :--- | :--- |
| **Tamu (Guest)** | — | `/` (Publik) | Menjelajahi beranda, mencari dan memfilter katalog, melihat detail buku, rating, serta membaca pengumuman. |
| **Pengunjung Umum** | `umum` | `/pengunjung` | Mendaftar mandiri dengan email umum, mengajukan peminjaman, masuk antrean reservasi, memantau denda/notifikasi, dan menulis ulasan. |
| **Mahasiswa** | `mahasiswa` | `/pengunjung` | Mendaftar dengan email kampus, mengakses seluruh fitur peminjaman, reservasi, perpanjangan masa pinjam, notifikasi jatuh tempo, dan ulasan. |
| **Pegawai Perpustakaan** | `pegawai` | `/pegawai` & `/kelola` | Mengonfirmasi pengajuan pinjam, memproses pengembalian & perpanjangan, memverifikasi pembayaran denda, serta mengelola buku dan pengumuman. |
| **Administrator** | `admin` | `/admin` & `/kelola` | Akun pengelola tunggal dengan akses penuh pada manajemen pengguna (`pegawai`, `mahasiswa`, `umum`), kategori buku, monitoring transaksi, laporan CSV, serta seluruh fitur `/kelola`. |

---

## Teknologi

| Kategori | Teknologi | Kegunaan dalam Proyek |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js (App Router) | Routing berbasis sistem file, *Server Components*, *Server Actions*, *Route Handlers*, dan proteksi rute. |
| **Library UI** | React (JavaScript) | Pembangunan komponen antarmuka interaktif, transisi non-blokir, dan pengelolaan *state* sisi klien. |
| **Styling** | Tailwind CSS v4 | Utilitas tata letak responsif, sistem warna kustom (`navy`, `yellow`), dan aksesibilitas fokus. |
| **Basis Data** | PostgreSQL (`pg`) | Penyimpanan relasional dengan transaksi atomik untuk pengguna, buku, sirkulasi, reservasi, denda, notifikasi, dan ulasan. |
| **Autentikasi & Validasi** | `jose`, `bcryptjs`, & Zod | Manajemen sesi JWT terenkripsi (`HttpOnly`), *hashing* kata sandi, serta validasi skema input di sisi server. |
| **Ikonografi** | Lucide React | Kumpulan ikon antarmuka yang konsisten dan ramah aksesibilitas. |

---

## Identitas Visual

Antarmuka Perpustakaan Cendekia mengusung tema akademik modern dengan kontras tinggi agar nyaman dibaca di perangkat desktop maupun seluler:

| Token Warna | Kode Warna | Peran Visual |
| :--- | :--- | :--- |
| **Navy Utama (`navy-800`)** | `#0A1172` | Warna identitas utama pada *header*, *sidebar* dasbor, *hero banner*, dan tombol aksi primer. |
| **Navy Lembut (`navy-50`)** | `#EEF2FF` | Latar belakang kartu informasi, *badge* peran/kategori, dan penyorot baris notifikasi belum dibaca. |
| **Kuning Emas (`yellow-500`)** | `#FFDA03` | Aksen sorotan utama, mahkota peringkat `#1` buku terpopuler, garis indikator menu aktif, dan tombol pencarian. |
| **Hijau Status (`green-700`)** | `#15803D` | Penanda stok buku tersedia, status akun/pengumuman aktif, transaksi selesai, dan denda lunas. |
| **Merah Peringatan (`red-600`)** | `#DC2626` | Penanda stok habis, keterlambatan pengembalian, denda tertunggak, dan aksi penghapusan data. |
| **Permukaan Netral (`n-50`)** | `#F8FAFC` | Latar belakang kanvas halaman dasbor agar kartu data tampil bersih dan terpisah jelas. |

---

## Struktur Direktori

```text
perpustakaan-cendekia/
├── public/                         # Aset statis publik (sampul default & gambar pendukung)
├── src/
│   ├── actions/                    # Next.js Server Actions (mutasi data & validasi server)
│   │   ├── announcements.js        # Tambah, ubah, dan hapus pengumuman
│   │   ├── auth.js                 # Login, registrasi akun baru, dan logout
│   │   ├── books.js                # Tambah, ubah, dan soft-delete koleksi buku
│   │   ├── categories.js           # Manajemen kategori buku oleh Admin
│   │   ├── loans.js                # Pengajuan pinjam, persetujuan, perpanjangan, pengembalian, & denda
│   │   ├── notifications.js        # Tandai notifikasi dibaca
│   │   ├── reservations.js         # Pembuatan & pembatalan antrean reservasi
│   │   ├── reviews.js              # Pengiriman rating & ulasan pembaca
│   │   └── users.js                # Manajemen pengguna oleh Admin (terkunci non-admin baru)
│   ├── app/
│   │   ├── icon.svg                # Ikon / logo utama Perpustakaan Cendekia
│   │   ├── globals.css             # Konfigurasi tema Tailwind CSS v4 & variabel warna
│   │   ├── (auth)/                 # Halaman autentikasi (login & register)
│   │   ├── (public)/               # Halaman publik (Beranda, Katalog, Detail Buku, Pengumuman)
│   │   ├── (dash)/                 # Route Group dasbor terproteksi
│   │   │   ├── admin/              # Halaman khusus Admin (dashboard, users, kategori, transaksi, laporan)
│   │   │   ├── kelola/             # Halaman bersama Admin & Pegawai (buku & pengumuman)
│   │   │   ├── pegawai/            # Halaman operasional sirkulasi Pegawai (peminjaman, pengembalian, perpanjangan, denda)
│   │   │   ├── pengunjung/         # Halaman dasbor Peminjam (dashboard, riwayat, ulasan, notifikasi)
│   │   │   └── layout.js           # Kerangka utama dasbor (cek sesi & render DashShell)
│   │   └── api/
│   │       ├── covers/[file]/      # Penyajian berkas sampul buku terunggah
│   │       ├── reports/loans.csv/  # Endpoint unduhan laporan transaksi CSV
│   │       └── upload/cover/       # Endpoint unggah & validasi gambar sampul buku
│   ├── components/                 # Komponen UI reusable (AutoFilterBar, BookCover, ConfirmForm, DashShell, KatalogFilter, ui.jsx)
│   ├── lib/
│   │   ├── data/                   # Query pembacaan data PostgreSQL (books, loans, users, announcements, categories)
│   │   ├── services/               # Logika bisnis inti (aturan pinjam, denda, antrean reservasi, pengingat)
│   │   ├── config.js               # Konstanta peran, aturan sirkulasi, zona waktu WITA, & kategori
│   │   ├── db.js                   # Koneksi PostgreSQL Pool & helper transaksi
│   │   ├── format.js               # Pemformatan tanggal WITA, mata uang Rupiah, & inisial
│   │   ├── nav.js                  # Konfigurasi menu navigasi berdasarkan peran
│   │   ├── session.js              # Manajemen sesi JWT & verifikasi otorisasi pengguna
│   │   ├── styles.js               # Helper kelas Tailwind CSS (badge, tombol, tabel, status stok)
│   │   ├── uploads.js              # Validasi magic bytes & penyimpanan file unggahan
│   │   └── validators.js           # Skema validasi input Zod
│   └── proxy.js                    # Proxy/middleware proteksi rute berdasarkan peran sesi
├── .env.example                    # Contoh konfigurasi variabel lingkungan
├── next.config.mjs                 # Konfigurasi Next.js
└── package.json                    # Daftar dependensi dan skrip perintah proyek
```

---

## Instalasi

### Prasyarat
- **Node.js** versi `18.18` atau lebih baru
- **PostgreSQL** versi `14` atau lebih baru
- **npm** / **pnpm** / **yarn**

### Langkah Pemasangan

1. **Kloning repositori proyek:**
   ```bash
   git clone [https://github.com/fadhiyahsyafikah/Perpustakaan-Cendekia.git](https://github.com/fadhiyahsyafikah/Perpustakaan-Cendekia.git)
   cd Perpustakaan-Cendekia
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Siapkan basis data PostgreSQL:**
   Buat database baru di PostgreSQL (contoh: `perpustakaan_cendekia`), lalu jalankan skrip SQL skema tabel dan data awal (*seed*) yang tersedia pada proyek atau gunakan berkas *backup* (`perpustakaan_cendekia_db`) database apabila ingin seluruh gambar sampul buku bawaan langsung tampil.

4. **Konfigurasi variabel lingkungan:**
   Salin `.env.example` menjadi `.env.local` di direktori utama proyek dan sesuaikan kredensial lokal Anda:
   ```env
   DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/perpustakaan_cendekia
   SESSION_SECRET=ganti-dengan-kunci-rahasia-minimal-32-karakter
   COOKIE_SECURE=false
   CAMPUS_EMAIL_DOMAIN=ac.id
   APP_TIMEZONE=Asia/Makassar
   ```

5. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` melalui peramban untuk mengakses aplikasi.

---

## Akun Demo

Gunakan kredensial pengujian berikut (sesuai data *seed* database lokal) untuk mencoba alur kerja setiap peran:

| Peran | Email | Password | Fokus Pengujian |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cendekia.ac.id` | `Cendekia123` | Kelola pengguna (`pegawai`, `mahasiswa`, `umum`), kategori buku, koleksi, pengumuman, monitoring transaksi, dan laporan CSV. |
| **Pegawai Perpustakaan** | `pegawai@cendekia.ac.id` | `Cendekia123` | Konfirmasi pengajuan pinjam, proses pengembalian, perpanjangan, pembayaran denda, serta kelola buku dan pengumuman. |
| **Mahasiswa** | `andi.pratama@ui.ac.id` | `Cendekia123` | Ajukan pinjam buku, masuk antrean reservasi, pantau notifikasi jatuh tempo, dan beri ulasan. |
| **Pengunjung Umum** | `naradefara@gmail.com` | `Nd56575899` | Registrasi umum, peminjaman buku, reservasi stok habis, dan riwayat transaksi. |

> **Catatan:** Kredensial di atas hanya ditujukan untuk pengujian lokal. Segera ubah kata sandi apabila aplikasi diterapkan pada lingkungan produksi.

---

## Pengujian

Pengujian fungsional dilakukan secara *end-to-end* pada seluruh skenario utama sistem:

| No | Skenario Pengujian | Hasil yang Diharapkan | Status |
| :---: | :--- | :--- | :---: |
| 1 | **Registrasi & Login Multi-Peran** | Mahasiswa mendaftar dengan email kampus, umum dengan email bebas, dan diarahkan ke dasbor sesuai perannya. | Lulus |
| 2 | **Pencarian & Filter Otomatis** | Pencarian judul/pengarang/pengguna, filter kategori atau status otomatis (*auto-render*), dan tombol hapus filter menampilkan hasil akurat. | Lulus |
| 3 | **Siklus Peminjaman & Pengembalian** | Pengajuan pinjam mengurangi stok setelah disetujui pegawai, dan pengembalian memulihkan stok buku. | Lulus |
| 4 | **Antrean Reservasi & Kedaluwarsa** | Buku dengan stok `0` membuka tombol reservasi; pengembalian memicu status `Siap Diambil` untuk antrean `#1`. | Lulus |
| 5 | **Perhitungan Denda Keterlambatan** | Pengembalian melewati tenggat otomatis menghitung denda harian dan memblokir pinjaman baru hingga lunas. | Lulus |
| 6 | **Pembatasan Akun Admin Tunggal** | Formulir dan Server Action menolak pembuatan maupun perubahan peran pengguna baru menjadi `admin`. | Lulus |

---

## Status Pengembangan

- [x] Halaman beranda publik dengan Podium 5 Buku Terpopuler dan daftar pengumuman terbaru.
- [x] Katalog buku dengan pencarian terpisah, filter kategori, pengurutan, dan paginasi URL.
- [x] Detail buku lengkap dengan tampilan sampul proporsional penuh, status stok, dan ulasan pembaca.
- [x] Alur peminjaman, perpanjangan masa pinjam, pengembalian, dan pengelolaan denda oleh pegawai.
- [x] Sistem antrean reservasi otomatis (FIFO) beserta pembersihan reservasi kedaluwarsa.
- [x] Dasbor terpisah untuk Admin (`/admin`), Pegawai (`/pegawai`), Manajemen Master (`/kelola`), dan Peminjam (`/pengunjung`).
- [x] Pencarian dan filter otomatis *real-time* (`AutoFilterBar`) pada halaman manajemen dan monitoring transaksi.
- [x] Ekspor laporan sirkulasi dan rekapitulasi denda ke format CSV.

---

## Catatan Keamanan

- **Kebijakan Single Admin:** Validasi skema Zod (`ASSIGNABLE_ROLES`) pada lapisan *Server Actions* (`src/actions/users.js`) secara ketat hanya mengizinkan penetapan peran `pegawai`, `mahasiswa`, dan `umum`, sehingga mencegah pembuatan akun `admin` tambahan melalui manipulasi form maupun permintaan langsung.
- **Proteksi Rute & Otorisasi Berlapis:** Setiap permintaan ke rute dasbor diperiksa melalui `src/proxy.js` dan diverifikasi ulang di tingkat halaman serta *Server Actions* menggunakan fungsi `requireUser()`.
- **Validasi Input, Berkas & Keamanan Query:** Seluruh masukan pengguna divalidasi menggunakan Zod, unggahan sampul divalidasi *magic bytes* (JPG/PNG/WebP maks. 2 MB), interaksi dengan PostgreSQL menggunakan *parameterized queries* (`pg`) untuk mencegah *SQL Injection*, dan ekspor CSV dilindungi dari *CSV Injection*.
- **Keamanan Sesi:** Kata sandi disimpan dalam bentuk *hash* `bcryptjs` dan token sesi JWT (`jose`) dikelola melalui *cookie* terenkripsi (`HttpOnly`).

---

## Referensi Proyek

- **Kontak Layanan Perpustakaan:** `layanan.perpus@cendekia.ac.id`
- **Jam Operasional:** Senin–Jumat (`08.00 – 17.00 WITA`) & Sabtu (`09.00 – 14.00 WITA`)
- **Pengembangan:** Fadhiyah Syafikah Firman (H071251019)
- **Konteks Pengembangan:** Proyek Akhir Praktikum Pengembangan Web — Program Studi Sistem Informasi, Fakultas Matematika dan Ilmu Pengetahuan Alam, Universitas Hasanuddin, 2026.