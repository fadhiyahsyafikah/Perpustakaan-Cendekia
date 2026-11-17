-- PERPUSTAKAAN CENDEKIA  YANG BARU |  Skema
-- CREATE DATABASE perpus_cendekia;

SET client_encoding = 'UTF8';

-- ----------------------------------------------------------------------
-- 1. BERSIHKAN OBJEK LAMA (agar berkas ini dapat dijalankan berulang kali)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS notifications, reservations, reviews, fines, loan_extensions,
                     loans, announcements, books, categories, users CASCADE;
DROP FUNCTION IF EXISTS wita_today();

-- ----------------------------------------------------------------------
-- 2. FUNGSI BANTU: tanggal hari ini menurut zona waktu Asia/Makassar (WITA)
--    Semua perhitungan tanggal (jatuh tempo, denda, blokir) memakai fungsi ini
--    sehingga zona waktu cukup diubah di satu tempat (BR-15).
-- ----------------------------------------------------------------------
CREATE FUNCTION wita_today() RETURNS date
LANGUAGE sql STABLE AS $$ SELECT (now() AT TIME ZONE 'Asia/Makassar')::date $$;

-- ----------------------------------------------------------------------
-- 3. TABEL
-- ----------------------------------------------------------------------

-- users: Admin, Pegawai, Mahasiswa, dan Umum (Pengunjung umum terdaftar)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(12)  NOT NULL CHECK (role IN ('admin','pegawai','mahasiswa','umum')),
  identity_number VARCHAR(30) NOT NULL UNIQUE, -- NIM, NIP, atau Nomor Identitas Umum (NIK)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_users_email_lower ON users (lower(email));

-- categories (genre buku)
CREATE TABLE categories (
  id  SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT
);

-- books (soft delete lewat deleted_at)
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(20)  NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(200) NOT NULL,
  publisher VARCHAR(150) NOT NULL,
  -- Batas atas tahun berjalan diperiksa oleh aplikasi (CHECK tidak boleh bergantung waktu)
  publish_year SMALLINT NOT NULL CHECK (publish_year BETWEEN 1400 AND 2100),
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  total_stock INT NOT NULL CHECK (total_stock >= 0),
  available_stock INT NOT NULL,
  max_loan_days SMALLINT NOT NULL CHECK (max_loan_days > 0),
  fine_per_day INT NOT NULL CHECK (fine_per_day >= 0),   -- rupiah
  cover_url VARCHAR(255),                         -- boleh kosong (sampul pengganti)
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT ck_books_stock CHECK (available_stock >= 0 AND available_stock <= total_stock)
);
-- ISBN unik hanya untuk buku yang belum dihapus (soft delete)
CREATE UNIQUE INDEX uq_books_isbn_active ON books (isbn) WHERE deleted_at IS NULL;

-- announcements
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(12) NOT NULL CHECK (category IN ('Operasional','Layanan','Acara')),
  release_date DATE NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Published')),
  author_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- loans (satu transaksi = satu eksemplar buku oleh satu peminjam)
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  status VARCHAR(24) NOT NULL DEFAULT 'Menunggu Konfirmasi'
    CHECK (status IN ('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan','Ditolak','Selesai')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  loan_date DATE,
  due_date DATE,
  returned_at DATE,
  extension_count SMALLINT NOT NULL DEFAULT 0 CHECK (extension_count BETWEEN 0 AND 1),
  reject_reason TEXT,
  approved_by INT REFERENCES users(id) ON DELETE RESTRICT,   -- pegawai yang menyetujui / menolak
  returned_confirmed_by INT REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT ck_loans_dates_set  CHECK (status NOT IN ('Sedang Dipinjam','Perpanjangan Diajukan','Selesai')
                                        OR (loan_date IS NOT NULL AND due_date IS NOT NULL)),
  CONSTRAINT ck_loans_returned CHECK (status <> 'Selesai' OR returned_at IS NOT NULL),
  CONSTRAINT ck_loans_reason CHECK (status <> 'Ditolak' OR reject_reason IS NOT NULL),
  CONSTRAINT ck_loans_date_order CHECK (returned_at IS NULL OR loan_date IS NULL OR returned_at >= loan_date)
);
-- BR-05: satu pengguna tidak boleh punya dua pinjaman aktif atas buku yang sama
CREATE UNIQUE INDEX uq_loans_active_user_book ON loans (user_id, book_id)
  WHERE status IN ('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan');

-- loan_extensions (riwayat perpanjangan)
CREATE TABLE loan_extensions (
  id SERIAL PRIMARY KEY,
  loan_id INT NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  status VARCHAR(12) NOT NULL DEFAULT 'Diajukan' CHECK (status IN ('Diajukan','Disetujui','Ditolak')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  old_due_date DATE NOT NULL,
  new_due_date DATE, -- NULL jika ditolak
  processed_by INT REFERENCES users(id) ON DELETE RESTRICT,
  processed_at TIMESTAMPTZ,
  note TEXT
);
-- hanya boleh ada satu pengajuan perpanjangan yang belum diproses per transaksi
CREATE UNIQUE INDEX uq_ext_pending ON loan_extensions (loan_id) WHERE status = 'Diajukan';

--fines (satu denda per transaksi, tarif disimpan sebagai snapshot)
CREATE TABLE fines (
  id SERIAL PRIMARY KEY,
  loan_id INT NOT NULL UNIQUE REFERENCES loans(id) ON DELETE RESTRICT,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  late_days INT NOT NULL CHECK (late_days >= 0),
  fine_per_day INT NOT NULL CHECK (fine_per_day >= 0),
  amount INT NOT NULL CHECK (amount >= 0),
  status VARCHAR(10) NOT NULL DEFAULT 'Tertunggak' CHECK (status IN ('Tertunggak','Lunas')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  recorded_by INT REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT ck_fines_amount CHECK (amount = late_days * fine_per_day),
  CONSTRAINT ck_fines_paid   CHECK (status <> 'Lunas' OR paid_at IS NOT NULL)
);

-- reviews (satu ulasan per transaksi Selesai)
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  loan_id INT NOT NULL UNIQUE REFERENCES loans(id) ON DELETE RESTRICT,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- reservations (OPSIONAL: antrean buku yang stoknya habis)
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(14) NOT NULL DEFAULT 'Menunggu'
    CHECK (status IN ('Menunggu','Siap Diambil','Selesai','Dibatalkan','Kedaluwarsa')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ  -- batas ambil (2 hari) saat Siap Diambil
);
CREATE UNIQUE INDEX uq_reservations_active ON reservations (user_id, book_id)
  WHERE status IN ('Menunggu','Siap Diambil');

-- notifications (OPSIONAL: log notifikasi pengguna)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  ref_loan_id INT REFERENCES loans(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- pengingat H-1 hanya satu kali per transaksi dan per jatuh tempo
CREATE UNIQUE INDEX uq_notif_reminder ON notifications (ref_loan_id, type)
  WHERE type = 'Pengingat Jatuh Tempo';

-- ----------------------------------------------------------------------
-- 4. INDEX (percepat pencarian, penyaringan, dan agregasi)
-- ----------------------------------------------------------------------
CREATE INDEX idx_loans_user_status ON loans (user_id, status);
CREATE INDEX idx_loans_book_status ON loans (book_id, status);
CREATE INDEX idx_loans_status_due ON loans (status, due_date);
CREATE INDEX idx_fines_user_status ON fines (user_id, status);
CREATE INDEX idx_books_category ON books (category_id);
CREATE INDEX idx_books_title_lower ON books (lower(title));
CREATE INDEX idx_books_author_lower ON books (lower(author));
CREATE INDEX idx_reviews_book ON reviews (book_id);
CREATE INDEX idx_announce_pub ON announcements (status, release_date DESC);
CREATE INDEX idx_notif_user_read ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_reserv_book_status ON reservations (book_id, status, created_at);