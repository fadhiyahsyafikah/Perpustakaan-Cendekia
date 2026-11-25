<div align="center">
  <img src="src/app/icon.svg" alt="Logo Perpustakaan Cendekia" width="240" height="240" />

  <h1>Perpustakaan Cendekia</h1>
  <p><strong>Ilmu Terhimpun, Cendekia Berkembang.</strong></p>
  <p>
    Sistem informasi manajemen perpustakaan berbasis web untuk pencarian katalog, peminjaman buku,
    antrean reservasi otomatis, pengelolaan denda, dan layanan sirkulasi terpadu.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-App%20Router-0A1172?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-JavaScript-1E3A8A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Zod-Validation-FFDA03?style=for-the-badge&logoColor=0A1172" alt="Zod" />
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

**Perpustakaan Cendekia** adalah website manajemen perpustakaan *full-stack* yang dirancang untuk mempermudah interaksi antara peminjam (mahasiswa maupun pengunjung umum) dengan petugas meja sirkulasi. Pengguna dapat menelusuri koleksi buku, mengajukan peminjaman secara daring sebelum mengambil buku fisik di perpustakaan, masuk ke antrean reservasi ketika stok habis, serta memantau tenggat pengembalian dan rincian denda dalam satu dasbor terpadu.

Sistem ini dibangun menggunakan **Next.js App Router** dengan **Server Components** dan **Server Actions**, terhubung langsung ke basis data relasional **PostgreSQL** untuk menjaga konsistensi stok eksemplar, riwayat transaksi, dan status antrean secara *real-time*.

---

## Fitur Utama Sistem

### 1. Eksplorasi Katalog & Beranda Publik
* **Podium 5 Buku Terpopuler:** Menampilkan 5 buku dengan frekuensi peminjaman tertinggi dalam tata letak podium bertingkat (`#1` hingga `#5`).
* **Pencarian Buku menggunakan Filter:** Pencarian berdasarkan judul buku atau nama pengarang yang dipisahkan dengan filter kategori dan pengurutan.
* **Detail Buku Komprehensif:** Menampilkan sampul buku secara utuh tanpa terpotong, metadata (ISBN, penerbit, tahun terbit, kategori), ketersediaan stok eksemplar, batas lama pinjam, tarif denda harian, rating bintang, dan ulasan pembaca.
* **Papan Pengumuman Terkategorisasi:** Informasi resmi perpustakaan yang dikelompokkan ke dalam kategori **Operasional**, **Layanan**, dan **Acara**.

### 2. Sirkulasi Peminjaman & Reservasi Otomatis (FIFO)
* **Pengajuan Pinjam Daring:** Peminjam mengajukan peminjaman dari halaman detail buku sebelum diverifikasi pegawai di meja sirkulasi.
* **Antrean Reservasi Otomatis:** Ketika stok tersedia bernilai `0`, peminjam dapat masuk ke antrean reservasi. Saat buku dikembalikan, sistem otomatis mengunci stok untuk pengantre urutan pertama dan mengirimkan notifikasi.
* **Pembersihan Reservasi Kedaluwarsa:** Pengecekan otomatis (`sweepExpiredReservations`) yang meneruskan hak ambil buku ke pengantre berikutnya apabila batas waktu pengambilan terlewati.
* **Perpanjangan & Perhitungan Denda:** Pengajuan perpanjangan masa pinjam serta pencatatan status keterlambatan dan pelunasan denda.

### 3. Notifikasi & Ulasan Pembaca
* **Pusat Notifikasi Peminjam:** Pengingat otomatis mendekati jatuh tempo, pemberitahuan denda baru, keputusan pengajuan pinjam/perpanjangan, serta informasi buku reservasi yang siap diambil.
* **Rating & Ulasan Terverifikasi:** Pembaca hanya dapat memberikan rating (1–5 bintang) dan ulasan setelah menyelesaikan proses peminjaman buku terkait.

### 4. Manajemen Data Master & Pengguna
* **Kelola Koleksi & Pengumuman:** Pengelolaan data buku, kategori buku, stok eksemplar, dan publikasi pengumuman oleh Admin dan Pegawai.
* **Manajemen Akun Pengguna:** Pengaturan data akun dan status keaktifan anggota oleh Administrator dengan kebijakan **Single Admin** (hanya satu akun Admin utama di dalam sistem).

---

## Alur Sirkulasi

### Alur Peminjaman Normal

```text
[Cari Buku di Katalog]
         │
         ▼
[Ajukan Pinjam] ──► Status: "Menunggu Konfirmasi"
         │
         ▼
[Verifikasi Pegawai di Meja Sirkulasi] ──► Status: "Sedang Dipinjam" (Stok berkurang 1)
         │
         ├──► (Opsional) [Ajukan Perpanjangan] ──► Status: "Perpanjangan Diajukan"
         │
         ▼
[Pengembalian Buku]
         ├──► Tepat Waktu ──► Status: "Selesai"
         └──► Terlambat   ──► Status: "Terlambat" / Denda "Tertunggak" ──► Bayar ──► "Lunas"
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
         ├──► Diambil sebelum tenggat ──► Klik "Ajukan Pinjam" ──► Masuk Alur Peminjaman
         └──► Melewati batas waktu    ──► Status: "Kedaluwarsa" ──► Dialihkan ke Antrean #2
```

---

## Tingkat Pengguna

Sistem menerapkan kontrol akses berbasis peran (*Role-Based Access Control*) ke dalam 4 tingkat pengguna utama (ditambah pengunjung tamu tanpa login):

| Peran | Kode Role | Rute Dasbor | Hak Akses & Wewenang |
| :--- | :--- | :--- | :--- |
| **Tamu (Guest)** | — | `/` (Publik) | Menjelajahi beranda, mencari dan memfilter katalog, melihat detail buku, rating, serta membaca pengumuman. |
| **Pengunjung Umum** | `umum` | `/pengunjung` | Mendaftar mandiri dengan email umum, mengajukan peminjaman, masuk antrean reservasi, memantau denda/notifikasi, dan menulis ulasan. |
| **Mahasiswa** | `mahasiswa` | `/pengunjung` | Mendaftar dengan email kampus, mengakses seluruh fitur peminjaman, reservasi, perpanjangan masa pinjam, notifikasi jatuh tempo, dan ulasan. |
| **Pegawai Perpustakaan** | `pegawai` | `/pegawai` & `/kelola` | Mengonfirmasi pengajuan pinjam, memproses pengembalian & perpanjangan, memverifikasi pembayaran denda, serta mengelola buku, kategori, dan pengumuman. |
| **Administrator** | `admin` | `/admin` & `/kelola` | Akun pengelola tunggal dengan akses penuh pada manajemen pengguna (`pegawai`, `mahasiswa`, `umum`) serta seluruh fitur `/kelola`. |

---

## Teknologi

| Kategori | Teknologi | Kegunaan dalam Proyek |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js (App Router) | Routing berbasis sistem file, *Server Components*, *Server Actions*, dan proteksi rute. |
| **Library UI** | React (JavaScript) | Pembangunan komponen antarmuka interaktif dan manajemen *state* sisi klien. |
| **Styling** | Tailwind CSS | Utilitas tata letak responsif, sistem warna kustom (`navy`, `yellow`), dan transisi mikro-interaksi. |
| **Basis Data** | PostgreSQL | Penyimpanan data pengguna, katalog buku, transaksi peminjaman, reservasi, denda, notifikasi, dan ulasan. |
| **Validasi Data** | Zod | Validasi skema input form dan pembatasan peran pada sisi server. |
| **Ikonografi** | Lucide React | Kumpulan ikon antarmuka yang konsisten dan ramah aksesibilitas. |

---

## Identitas Visual

Antarmuka Perpustakaan Cendekia mengusung tema akademik modern dengan kontras tinggi agar nyaman dibaca di perangkat desktop maupun seluler:

| Token Warna | Kode Warna | Peran Visual |
| :--- | :--- | :--- |
| **Navy Utama (`navy-800`)** | `#0A1172` | Warna identitas utama pada *header*, *sidebar* dasbor, *hero banner*, dan tombol aksi primer. |
| **Navy Lembut (`navy-50`)** | `#EEF2FF` | Latar belakang kartu informasi, *badge* kategori, dan penyorot baris notifikasi belum dibaca. |
| **Kuning Emas (`yellow-500`)** | `#FFDA03` | Aksen sorotan utama, mahkota peringkat `#1` buku terpopuler, garis indikator menu aktif, dan tombol pencarian. |
| **Hijau Status (`green-700`)** | `#15803D` | Penanda stok buku tersedia, transaksi selesai, denda lunas, dan kategori pengumuman **Layanan**. |
| **Merah Peringatan (`red-600`)** | `#DC2626` | Penanda stok habis, keterlambatan pengembalian, denda tertunggak, dan status ditolak/kedaluwarsa. |
| **Permukaan Netral (`n-50`)** | `#F8FAFC` | Latar belakang kanvas halaman dasbor agar kartu data tampil bersih dan terpisah jelas. |

---

## Struktur Direktori

```text
perpustakaan-cendekia/
├── public/                     # Aset statis publik (gambar & sampul default)
├── src/
│   ├── icon.svg                # Ikon / logo utama Perpustakaan Cendekia
│   ├── actions/                # Next.js Server Actions (mutasi data & validasi server)
│   │   ├── auth.js             # Login, registrasi akun baru, dan logout
│   │   ├── loans.js            # Pengajuan pinjam, persetujuan, perpanjangan, & pengembalian
│   │   ├── notifications.js    # Tandai notifikasi dibaca
│   │   ├── reservations.js     # Pembuatan & pembatalan antrean reservasi
│   │   ├── reviews.js          # Pengiriman rating & ulasan pembaca
│   │   └── users.js            # Manajemen pengguna oleh Admin (terkunci non-admin baru)
│   ├── app/
│   │   ├── (auth)/             # Halaman autentikasi (login & register)
│   │   ├── (public)/           # Halaman publik (Beranda, Katalog, Detail Buku, Pengumuman)
│   │   └── (dash)/             # Route Group dasbor terproteksi
│   │       ├── admin/          # Halaman khusus Administrator (kelola akun pengguna)
│   │       ├── kelola/         # Halaman bersama Admin & Pegawai (buku, kategori, pengumuman)
│   │       ├── pegawai/        # Halaman operasional sirkulasi Pegawai Perpustakaan
│   │       ├── pengunjung/     # Halaman dasbor Peminjam (Mahasiswa & Pengunjung Umum)
│   │       └── layout.js       # Kerangka utama dasbor (cek sesi & render DashShell)
│   ├── components/             # Komponen UI reusable (BookCover, DashShell, KatalogFilter, ui.jsx)
│   ├── lib/
│   │   ├── data/               # Query pembacaan data PostgreSQL (books, loans, announcements)
│   │   ├── services/           # Logika bisnis inti (aturan pinjam, denda, antrean reservasi)
│   │   ├── config.js           # Konstanta peran, aturan sirkulasi, & kategori
│   │   ├── format.js           # Pemformatan tanggal WITA, mata uang Rupiah, & inisial
│   │   ├── nav.js              # Konfigurasi menu navigasi berdasarkan peran
│   │   ├── session.js          # Manajemen sesi & verifikasi otorisasi pengguna
│   │   ├── styles.js           # Helper kelas Tailwind CSS (badge, tombol, status stok)
│   │   └── validators.js       # Skema validasi input Zod
│   └── proxy.js                # Middleware/proxy proteksi rute berdasarkan peran sesi
├── .env.local                  # Variabel lingkungan (koneksi database & secret sesi)
├── next.config.mjs             # Konfigurasi Next.js
└── package.json                # Daftar dependensi dan skrip perintah proyek
```

---

## Instalasi

### Prasyarat
* **Node.js** versi `18.18` atau lebih baru
* **PostgreSQL** versi `14` atau lebih baru
* **npm** / **pnpm** / **yarn**

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
   Buat database baru di PostgreSQL (misalnya `perpustakaan_cendekia`), lalu jalankan skrip SQL skema tabel dan data awal (*seed*) yang tersedia pada proyek, jika ingin cover buku tetap tampil maka jalankan file back-up.

4. **Konfigurasi variabel lingkungan:**
   Buat file `.env.local` di direktori utama proyek dan isi kredensial sesuai lingkungan lokal Anda, isinya dapat terlihat di `.env.example`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/perpustakaan_cendekia"
   SESSION_SECRET="ganti-dengan-kunci-rahasia-minimal-32-karakter"
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
| **Administrator** | `admin@cendekia.ac.id` | `Cendekia123` | Kelola pengguna (`pegawai`, `mahasiswa`, `umum`), katalog, kategori, dan pengumuman. |
| **Pegawai Perpustakaan** | `pegawai@cendekia.ac.id` | `Cendekia123` | Konfirmasi pengajuan pinjam, proses pengembalian, perpanjangan, dan pembayaran denda. |
| **Mahasiswa** | `andi.pratama@ui.ac.id` | `Cendekia123` | Ajukan pinjam buku, masuk antrean reservasi, pantau notifikasi jatuh tempo, dan beri ulasan. |
| **Pengunjung Umum** | `naradefara@gmail.com` | `Nd56575899` | Registrasi umum, peminjaman buku, reservasi stok habis, dan riwayat transaksi. |

> **Catatan:** Kredensial di atas hanya ditujukan untuk pengujian lokal. Segera ubah kata sandi apabila aplikasi diterapkan pada lingkungan produksi.

---

## Pengujian

Pengujian fungsional dilakukan secara *end-to-end* pada seluruh skenario utama sistem:

| No | Skenario Pengujian | Hasil yang Diharapkan | Status |
| :---: | :--- | :--- | :---: |
| 1 | **Registrasi & Login Multi-Peran** | Mahasiswa mendaftar dengan email kampus, umum dengan email bebas, dan diarahkan ke dasbor sesuai perannya. | Lulus |
| 2 | **Pencarian & Filter Katalog** | Pencarian judul/pengarang, filter kategori otomatis, dan tombol hapus filter menampilkan hasil akurat. | Lulus |
| 3 | **Siklus Peminjaman & Pengembalian** | Pengajuan pinjam mengurangi stok setelah disetujui pegawai, dan pengembalian memulihkan stok buku. | Lulus |
| 4 | **Antrean Reservasi & Kedaluwarsa** | Buku dengan stok `0` membuka tombol reservasi; pengembalian memicu status `Siap Diambil` untuk antrean `#1`. | Lulus |
| 5 | **Perhitungan Denda Keterlambatan** | Pengembalian melewati tenggat otomatis menghitung denda harian dan memblokir pinjaman baru hingga lunas. | Lulus |
| 6 | **Pembatasan Akun Admin Tunggal** | Formulir dan Server Action menolak pembuatan maupun perubahan peran pengguna baru menjadi `admin`. | Lulus |

---

## Status Pengembangan

* [x] Halaman beranda publik dengan Podium 5 Buku Terpopuler dan daftar pengumuman terbaru.
* [x] Katalog buku dengan pencarian terpisah, filter kategori, pengurutan, dan paginasi URL.
* [x] Detail buku lengkap dengan tampilan sampul proporsional penuh, status stok, dan ulasan pembaca.
* [x] Alur peminjaman, perpanjangan masa pinjam, pengembalian, dan pengelolaan denda oleh pegawai.
* [x] Sistem antrean reservasi otomatis (FIFO) beserta pembersihan reservasi kedaluwarsa.
* [x] Dasbor terpisah untuk Admin (`/admin`), Pegawai (`/pegawai`), Manajemen Master (`/kelola`), dan Peminjam (`/pengunjung`).
* [ ] Ekspor laporan sirkulasi dan rekapitulasi denda bulanan ke format CSV/PDF.

---

## Catatan Keamanan

* **Kebijakan Single Admin:** Validasi skema Zod (`ASSIGNABLE_ROLES`) pada lapisan *Server Actions* (`src/actions/users.js`) secara ketat hanya mengizinkan penetapan peran `pegawai`, `mahasiswa`, dan `umum`, sehingga mencegah pembuatan akun `admin` tambahan melalui manipulasi form maupun permintaan API langsung.
* **Proteksi Rute & Otorisasi Berlapis:** Setiap permintaan ke rute dasbor diperiksa melalui `src/proxy.js` dan diverifikasi ulang di tingkat halaman serta *Server Actions* menggunakan fungsi `requireUser()`.
* **Validasi Input & Keamanan Query:** Seluruh masukan pengguna divalidasi menggunakan Zod sebelum diproses, dan interaksi dengan PostgreSQL menggunakan *parameterized queries* untuk mencegah celah *SQL Injection*.
* **Keamanan Sesi:** Kata sandi disimpan dalam bentuk *hash* kriptografis dan token sesi dikelola melalui *cookie* terenkripsi (`HttpOnly`).

---

## Referensi Proyek

* **Kontak Layanan Perpustakaan:** `perpustakaan@cendekia.ac.id`
* **Jam Operasional:** Senin–Jumat (`08.00 – 17.00 WITA`) & Sabtu (`09.00 – 14.00 WITA`)
* **Pengembangan:** Fadhiyah Syafikah Firman (H071251019)
* **Konteks Pengembangan:** Proyek Akhir Praktikum Pengembangan Web — Program Studi Sistem Informasi, Fakultas Matematika dan Ilmu Pengetahuan Alam, Universitas Hasanuddin, 2026.