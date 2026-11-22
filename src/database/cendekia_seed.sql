-- DATA AWAL (SEED)

INSERT INTO users (full_name, email, password_hash, role, identity_number, is_active) VALUES
  -- Admin & Pegawai (menggunakan domain @cendekia.ac.id)
  ('Administrator Cendekia', 'admin@cendekia.ac.id', '$2b$10$U4CS8FUPSmfp3wqo2MZp7eioDd.TH6V9ELa40pQiba/u.gjNjMg2q', 'admin', 'ADM-001', TRUE),
  ('Hasanuddin Pratama', 'pegawai1@cendekia.ac.id', '$2b$10$di2w2osltb0SgINda.emgOEWgr4X5q0ia3l3E65lh/qNdpE.eXXoy', 'pegawai', 'PGW-001', TRUE),
  ('Nur Aisyah', 'pegawai2@cendekia.ac.id', '$2b$10$TlLj16mwOj6T.Zgp7Xg1XODPS1CP3Y3mKGrltyY0yTFyehLn.ZX..', 'pegawai', 'PGW-002', TRUE),
  
  -- Mahasiswa (menggunakan domain berbagai universitas)
  ('Andi Pratama', 'rizky.pratama@ui.ac.id', '$2b$10$f62Bbdl/oy97IOQRQLtjyu0GQekuNv22/WyvG.O4n.rEFWuihdTLa', 'mahasiswa', '2024001', TRUE),
  ('Siti Rahmawati', 'siti.arahma@itb.ac.id', '$2b$10$kTcG76IMEOohJL8FWPQiNu30MU/Cdt.CbcIDtpMU.e8LJF7Q25juS', 'mahasiswa', '2024002', TRUE),
  ('Rizky Ramadhan', 'ahmad.fauzan@unair.ac.id', '$2b$10$kbfZhFMWXqwyHmyDOQHf6u5RyqcRTqo38WpHtNuyu8DTg/sii47i.', 'mahasiswa', '2024003', TRUE),
  ('Dewi Lestari', 'dewi.lestari@ipb.ac.id', '$2b$10$W8NOrVQ/tI4GibSzAZE/guQMj4wwNZ5xfirtP8BP0cIPGLVv5mGRm', 'mahasiswa', '2024004', TRUE),

  -- Pengunjung Umum Terdaftar (role: umum)
  ('Budi Santoso', 'budi.santoso88@gmail.com', '$2b$10$f62Bbdl/oy97IOQRQLtjyu0GQekuNv22/WyvG.O4n.rEFWuihdTLa', 'umum', 'UMM-001', TRUE),
  ('Rina Marlina', 'rina.marlina@yahoo.com', '$2b$10$kTcG76IMEOohJL8FWPQiNu30MU/Cdt.CbcIDtpMU.e8LJF7Q25juS', 'umum', 'UMM-002', TRUE);

INSERT INTO categories (name, code, description) VALUES
  ('Sastra & Fiksi Indonesia', 'SFI', 'Novel, cerpen, dan karya sastra penulis Indonesia dari masa klasik hingga kontemporer.'),
  ('Romance & Novel Populer', 'ROM', 'Novel romansa dan bacaan populer yang ringan untuk dinikmati.'),
  ('Fantasi & Fiksi Ilmiah', 'FAN', 'Dunia imajinasi: fantasi, petualangan, dan fiksi ilmiah.'),
  ('Fiksi Dunia, Sastra Klasik & Thriller', 'FDK', 'Karya sastra dunia, novel klasik, dan cerita misteri atau thriller.'),
  ('Sejarah, Politik & Biografi', 'SPB', 'Buku sejarah, pemikiran politik, serta kisah hidup tokoh.'),
  ('Sains Populer & Kesehatan', 'SAI', 'Ilmu pengetahuan alam dan kesehatan yang ditulis dengan bahasa populer.'),
  ('Komputer & Teknologi', 'KOM', 'Pemrograman, rekayasa perangkat lunak, algoritma, dan kecerdasan buatan.'),
  ('Bisnis & Ekonomi', 'BIS', 'Kewirausahaan, keuangan, dan ilmu ekonomi populer.'),
  ('Pengembangan Diri, Psikologi & Filsafat', 'PDF', 'Kebiasaan, psikologi, dan filsafat hidup untuk berkembang.'),
  ('Agama & Spiritualitas', 'AGM', 'Bacaan keagamaan dan spiritualitas.');

-- Koleksi buku: 96 judul
INSERT INTO books (isbn, title, author, publisher, publish_year, category_id, total_stock, available_stock, max_loan_days, fine_per_day, cover_url)
SELECT v.isbn, v.title, v.author, v.publisher, v.yr, c.id, v.stok, v.stok, v.hari, v.denda, NULL
FROM (VALUES
  (1, '9786022916628', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 'Sastra & Fiksi Indonesia', 5, 14, 1000),
  (2, '9786022916635', 'Sang Pemimpi', 'Andrea Hirata', 'Bentang Pustaka', 2006, 'Sastra & Fiksi Indonesia', 3, 14, 1000),
  (3, '9786027888982', 'Edensor', 'Andrea Hirata', 'Bentang Pustaka', 2007, 'Sastra & Fiksi Indonesia', 4, 14, 1000),
  (4, '9786022911029', 'Ayah', 'Andrea Hirata', 'Bentang Pustaka', 2015, 'Sastra & Fiksi Indonesia', 5, 14, 1000),
  (5, '9786231066329', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Lentera Dipantara', 2005, 'Sastra & Fiksi Indonesia', 2, 14, 1000),
  (6, '9786231066336', 'Anak Semua Bangsa', 'Pramoedya Ananta Toer', 'Lentera Dipantara', 2006, 'Sastra & Fiksi Indonesia', 3, 14, 1000),
  (7, '9786231066343', 'Jejak Langkah', 'Pramoedya Ananta Toer', 'Lentera Dipantara', 2006, 'Sastra & Fiksi Indonesia', 4, 14, 1000),
  (8, '9786231066350', 'Rumah Kaca', 'Pramoedya Ananta Toer', 'Lentera Dipantara', 2006, 'Sastra & Fiksi Indonesia', 5, 14, 1000),
  (9, '9786024242756', 'Pulang', 'Leila S. Chudori', 'Kepustakaan Populer Gramedia', 2012, 'Sastra & Fiksi Indonesia', 2, 14, 1000),
  (10, '9786024246945', 'Laut Bercerita', 'Leila S. Chudori', 'Kepustakaan Populer Gramedia', 2017, 'Sastra & Fiksi Indonesia', 3, 14, 1000),
  (11, '9789792248616', 'Negeri 5 Menara', 'A. Fuadi', 'Gramedia Pustaka Utama', 2009, 'Sastra & Fiksi Indonesia', 4, 14, 1000),
  (12, '9786020681955', 'Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Gramedia Pustaka Utama', 2003, 'Sastra & Fiksi Indonesia', 5, 14, 1000),
  (13, '9786020312583', 'Cantik Itu Luka', 'Eka Kurniawan', 'Gramedia Pustaka Utama', 2015, 'Sastra & Fiksi Indonesia', 2, 14, 1000),
  (14, '9786024243999', 'Saman', 'Ayu Utami', 'Kepustakaan Populer Gramedia', 1998, 'Sastra & Fiksi Indonesia', 3, 14, 1000),
  (15, '9786022601289', 'Siti Nurbaya', 'Marah Rusli', 'Balai Pustaka', 1922, 'Sastra & Fiksi Indonesia', 4, 14, 1000),
  (16, '9786022601241', 'Salah Asuhan', 'Abdoel Moeis', 'Balai Pustaka', 1928, 'Sastra & Fiksi Indonesia', 5, 14, 1000),
  (17, '9786022504177', 'Di Bawah Lindungan Ka''bah', 'Hamka', 'Balai Pustaka', 1938, 'Sastra & Fiksi Indonesia', 2, 14, 1000),
  (18, '9786022504160', 'Tenggelamnya Kapal Van Der Wijck', 'Hamka', 'Balai Pustaka', 1939, 'Sastra & Fiksi Indonesia', 3, 14, 1000),
  (19, '9786028811613', 'Filosofi Kopi', 'Dee Lestari', 'Truedee Books', 2006, 'Sastra & Fiksi Indonesia', 4, 14, 1000),
  (20, '978602899794', 'Rindu', 'Tere Liye', 'Republika', 2014, 'Sastra & Fiksi Indonesia', 5, 14, 1000),
  (21, '9786027870413', 'Dilan 1990', 'Pidi Baiq', 'Pastel Books', 2014, 'Romance & Novel Populer', 1, 7, 1000),
  (22, '9786025508615', 'Mariposa', 'Luluk HF', 'Coconut Books', 2018, 'Romance & Novel Populer', 3, 7, 1000),
  (23, '9789793604022', 'Ayat-Ayat Cinta', 'Habiburrahman El Shirazy', 'Republika', 2004, 'Romance & Novel Populer', 4, 7, 1000),
  (24, '9786020318929', 'Critical Eleven', 'Ika Natassa', 'Gramedia Pustaka Utama', 2015, 'Romance & Novel Populer', 5, 7, 1000),
  (25, '9786020303314', 'Antologi Rasa', 'Ika Natassa', 'Gramedia Pustaka Utama', 2011, 'Romance & Novel Populer', 2, 7, 1000),
  (26, '9789791227780', 'Perahu Kertas', 'Dee Lestari', 'Bentang Pustaka', 2009, 'Romance & Novel Populer', 3, 7, 1000),
  (27, '9786020658049', 'Home Sweet Loan', 'Almira Bastari', 'Gramedia Pustaka Utama', 2021, 'Romance & Novel Populer', 4, 7, 1000),
  (28, '9780143138730', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 2002, 'Romance & Novel Populer', 5, 7, 1000),
  (29, '9781853260209', 'Jane Eyre', 'Charlotte Brontë', 'Penguin Classics', 2006, 'Romance & Novel Populer', 2, 7, 1000),
  (30, '9780141345659', 'The Fault in Our Stars', 'John Green', 'Dutton Books', 2012, 'Romance & Novel Populer', 3, 7, 1000),
  (31, '9786022910527', 'Supernova: Ksatria, Puteri, dan Bintang Jatuh', 'Dee Lestari', 'Truedee Books', 2001, 'Fantasi & Fiksi Ilmiah', 4, 14, 1000),
  (32, '9786020332956', 'Bumi', 'Tere Liye', 'Gramedia Pustaka Utama', 2014, 'Fantasi & Fiksi Ilmiah', 5, 14, 1000),
  (33, '9786020324784', 'Hujan', 'Tere Liye', 'Gramedia Pustaka Utama', 2016, 'Fantasi & Fiksi Ilmiah', 2, 14, 1000),
  (34, '9796558513', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Scholastic', 1997, 'Fantasi & Fiksi Ilmiah', 3, 14, 1000),
  (35, '9789792286335', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', 2012, 'Fantasi & Fiksi Ilmiah', 4, 14, 1000),
  (36, '9786020615110', 'The Fellowship of the Ring', 'J.R.R. Tolkien', 'Houghton Mifflin', 2012, 'Fantasi & Fiksi Ilmiah', 5, 14, 1000),
  (37, '9786020644547', 'The Lion, the Witch and the Wardrobe', 'C.S. Lewis', 'HarperCollins', 1994, 'Fantasi & Fiksi Ilmiah', 2, 14, 1000),
  (38, '9786020900292', 'A Game of Thrones', 'George R.R. Martin', 'Bantam', 2011, 'Fantasi & Fiksi Ilmiah', 3, 14, 1000),
  (39, '9780441172719', 'Dune', 'Frank Herbert', 'Ace', 1990, 'Fantasi & Fiksi Ilmiah', 4, 14, 1000),
  (40, '9780553293357', 'Foundation', 'Isaac Asimov', 'Bantam', 1991, 'Fantasi & Fiksi Ilmiah', 5, 14, 1000),
  (41, '9780812550702', 'Ender''s Game', 'Orson Scott Card', 'Tor', 1994, 'Fantasi & Fiksi Ilmiah', 2, 14, 1000),
  (42, '9780345391803', 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 'Del Rey', 1995, 'Fantasi & Fiksi Ilmiah', 3, 14, 1000),
  (43, '9780441569595', 'Neuromancer', 'William Gibson', 'Ace', 1984, 'Fantasi & Fiksi Ilmiah', 4, 14, 1000),
  (44, '9780593135204', 'Project Hail Mary', 'Andy Weir', 'Ballantine Books', 2021, 'Fantasi & Fiksi Ilmiah', 5, 14, 1000),
  (45, '9780593318171', 'Klara and the Sun', 'Kazuo Ishiguro', 'Knopf', 2021, 'Fantasi & Fiksi Ilmiah', 2, 14, 1000),
  (46, '9780451524935', '1984', 'George Orwell', 'Plume', 2003, 'Fiksi Dunia, Sastra Klasik & Thriller', 3, 14, 1000),
  (47, '9780451526342', 'Animal Farm', 'George Orwell', 'Plume', 2003, 'Fiksi Dunia, Sastra Klasik & Thriller', 4, 14, 1000),
  (48, '9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 2002, 'Fiksi Dunia, Sastra Klasik & Thriller', 5, 14, 1000),
  (49, '9780743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 2004, 'Fiksi Dunia, Sastra Klasik & Thriller', 2, 14, 1000),
  (50, '9780060850524', 'Brave New World', 'Aldous Huxley', 'Harper Perennial', 2006, 'Fiksi Dunia, Sastra Klasik & Thriller', 3, 14, 1000),
  (51, '9780399501487', 'Lord of the Flies', 'William Golding', 'Perigee', 2003, 'Fiksi Dunia, Sastra Klasik & Thriller', 4, 14, 1000),
  (52, '9780684801223', 'The Old Man and the Sea', 'Ernest Hemingway', 'Scribner', 1995, 'Fiksi Dunia, Sastra Klasik & Thriller', 5, 14, 1000),
  (53, '9780062315007', 'The Alchemist', 'Paulo Coelho', 'HarperOne', 1993, 'Fiksi Dunia, Sastra Klasik & Thriller', 2, 14, 1000),
  (54, '9780156012195', 'The Little Prince', 'Antoine de Saint-Exupéry', 'Harcourt', 2000, 'Fiksi Dunia, Sastra Klasik & Thriller', 3, 14, 1000),
  (55, '9780307588371', 'Gone Girl', 'Gillian Flynn', 'Broadway Books', 2012, 'Fiksi Dunia, Sastra Klasik & Thriller', 4, 14, 1000),
  (56, '9780063251922', 'Demon Copperhead', 'Barbara Kingsolver', 'Harper', 2022, 'Fiksi Dunia, Sastra Klasik & Thriller', 2, 14, 1000),
  (57, '9780385547345', 'Lessons in Chemistry', 'Bonnie Garmus', 'Doubleday', 2022, 'Fiksi Dunia, Sastra Klasik & Thriller', 3, 14, 1000),
  (58, '9780593321201', 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'Knopf', 2022, 'Fiksi Dunia, Sastra Klasik & Thriller', 4, 14, 1000),
  (59, '9789799731289', 'Jalan Raya Pos, Jalan Daendels', 'Pramoedya Ananta Toer', 'Lentera Dipantara', 2005, 'Sejarah, Politik & Biografi', 5, 14, 1000),
  (60, '9786025792403', 'Madilog', 'Tan Malaka', 'Narasi', 1943, 'Sejarah, Politik & Biografi', 3, 14, 1000),
  (61, '9789791255134', 'Habibie & Ainun', 'B.J. Habibie', 'THC Mandiri', 2010, 'Sejarah, Politik & Biografi', 4, 14, 1000),
  (62, '9786029498523', 'Sepatu Dahlan', 'Khrisna Pabichara', 'Noura Books', 2012, 'Sejarah, Politik & Biografi', 5, 14, 1000),
  (63, '9780062316097', 'Sapiens', 'Yuval Noah Harari', 'Harper', 2015, 'Sejarah, Politik & Biografi', 2, 14, 1000),
  (64, '9780062464316', 'Homo Deus', 'Yuval Noah Harari', 'Harper', 2017, 'Sejarah, Politik & Biografi', 3, 14, 1000),
  (65, '9780593734223', 'Nexus', 'Yuval Noah Harari', 'Random House', 2024, 'Sejarah, Politik & Biografi', 4, 14, 1000),
  (66, '9780393317558', 'Guns, Germs, and Steel', 'Jared Diamond', 'W. W. Norton', 1999, 'Sejarah, Politik & Biografi', 5, 14, 1000),
  (67, '9780553380163', 'A Brief History of Time', 'Stephen Hawking', 'Bantam', 1998, 'Sains Populer & Kesehatan', 2, 14, 1000),
  (68, '9780345539434', 'Cosmos', 'Carl Sagan', 'Ballantine Books', 2013, 'Sains Populer & Kesehatan', 3, 14, 1000),
  (69, '9780393609394', 'Astrophysics for People in a Hurry', 'Neil deGrasse Tyson', 'W. W. Norton', 2017, 'Sains Populer & Kesehatan', 4, 14, 1000),
  (70, '9780198788607', 'The Selfish Gene', 'Richard Dawkins', 'Oxford University Press', 2006, 'Sains Populer & Kesehatan', 5, 14, 1000),
  (71, '9780593236598', 'Outlive', 'Peter Attia', 'Harmony', 2023, 'Sains Populer & Kesehatan', 2, 14, 1000),
  (72, '9780132350884', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'Komputer & Teknologi', 2, 14, 2000),
  (73, '9780134494166', 'Clean Architecture', 'Robert C. Martin', 'Pearson', 2017, 'Komputer & Teknologi', 4, 14, 2000),
  (74, '9780135957059', 'The Pragmatic Programmer (20th Anniv.)', 'David Thomas & Andrew Hunt', 'Addison-Wesley', 2019, 'Komputer & Teknologi', 5, 14, 2000),
  (75, '9780201633610', 'Design Patterns', 'Erich Gamma et al.', 'Addison-Wesley', 1994, 'Komputer & Teknologi', 2, 14, 2000),
  (76, '9780262033848', 'Introduction to Algorithms (3rd ed.)', 'Thomas H. Cormen et al.', 'MIT Press', 2009, 'Komputer & Teknologi', 3, 14, 2000),
  (77, '9780735619678', 'Code Complete (2nd ed.)', 'Steve McConnell', 'Microsoft Press', 2004, 'Komputer & Teknologi', 4, 14, 2000),
  (78, '9780134757599', 'Refactoring (2nd ed.)', 'Martin Fowler', 'Addison-Wesley', 2018, 'Komputer & Teknologi', 5, 14, 2000),
  (79, '9781449373320', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'O''Reilly Media', 2017, 'Komputer & Teknologi', 2, 14, 2000),
  (80, '9780134610993', 'Artificial Intelligence: A Modern Approach (4th ed.)', 'Stuart Russell & Peter Norvig', 'Pearson', 2020, 'Komputer & Teknologi', 3, 14, 2000),
  (81, '9780593716717', 'Co-Intelligence', 'Ethan Mollick', 'Portfolio', 2024, 'Komputer & Teknologi', 4, 14, 2000),
  (82, '9781612680194', 'Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Plata Publishing', 2011, 'Bisnis & Ekonomi', 5, 14, 1000),
  (83, '9780804139298', 'Zero to One', 'Peter Thiel & Blake Masters', 'Crown Business', 2014, 'Bisnis & Ekonomi', 2, 14, 1000),
  (84, '9780307887894', 'The Lean Startup', 'Eric Ries', 'Crown Business', 2011, 'Bisnis & Ekonomi', 3, 14, 1000),
  (85, '9780374533557', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Farrar, Straus and Giroux', 2011, 'Bisnis & Ekonomi', 4, 14, 1000),
  (86, '9780857197689', 'The Psychology of Money', 'Morgan Housel', 'Harriman House', 2020, 'Bisnis & Ekonomi', 5, 14, 1000),
  (87, '9780060731335', 'Freakonomics', 'Steven D. Levitt & Stephen J. Dubner', 'William Morrow', 2005, 'Bisnis & Ekonomi', 2, 14, 1000),
  (88, '9786024125189', 'Filosofi Teras', 'Henry Manampiring', 'Kompas', 2018, 'Pengembangan Diri, Psikologi & Filsafat', 3, 7, 1000),
  (89, '9786021637517', 'Self Driving', 'Rhenald Kasali', 'Mizan', 2014, 'Pengembangan Diri, Psikologi & Filsafat', 4, 7, 1000),
  (90, '9780735211292', 'Atomic Habits', 'James Clear', 'Avery', 2018, 'Pengembangan Diri, Psikologi & Filsafat', 5, 7, 1000),
  (91, '9781982137274', 'The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'Free Press', 2004, 'Pengembangan Diri, Psikologi & Filsafat', 2, 7, 1000),
  (92, '9780671027032', 'How to Win Friends and Influence People', 'Dale Carnegie', 'Pocket Books', 1998, 'Pengembangan Diri, Psikologi & Filsafat', 3, 7, 1000),
  (93, '9781455586691', 'Deep Work', 'Cal Newport', 'Grand Central Publishing', 2016, 'Pengembangan Diri, Psikologi & Filsafat', 4, 7, 1000),
  (94, '9780345472328', 'Mindset', 'Carol S. Dweck', 'Ballantine Books', 2007, 'Pengembangan Diri, Psikologi & Filsafat', 5, 7, 1000),
  (95, '9780807014271', 'Man''s Search for Meaning', 'Viktor E. Frankl', 'Beacon Press', 2006, 'Pengembangan Diri, Psikologi & Filsafat', 2, 7, 1000),
  (96, '9786028997980', 'Tasawuf Modern', 'Hamka', 'Republika', 1939, 'Agama & Spiritualitas', 3, 14, 1000)
) AS v(urut, isbn, title, author, publisher, yr, genre, stok, hari, denda)
JOIN categories c ON c.name = v.genre
ORDER BY v.urut;

-- 1. Transaksi contoh utama (tanggal RELATIF terhadap wita_today())
INSERT INTO loans (user_id, book_id, status, requested_at, loan_date, due_date, returned_at,
                   extension_count, reject_reason, approved_by, returned_confirmed_by)
SELECT u.id, b.id, v.status,
       now() + v.req_off * INTERVAL '1 day',
       CASE WHEN v.loan_off IS NULL THEN NULL ELSE wita_today() + v.loan_off END,
       CASE WHEN v.loan_off IS NULL THEN NULL ELSE wita_today() + v.loan_off + b.max_loan_days * (1 + v.ext) END,
       CASE WHEN v.ret_off  IS NULL THEN NULL ELSE wita_today() + v.ret_off END,
       v.ext, v.reason,
       (SELECT id FROM users WHERE email = v.approver),
       (SELECT id FROM users WHERE email = v.returner)
FROM (VALUES
  ('rizky.pratama@ui.ac.id','Laskar Pelangi','Selesai',-31,-30,-25,0,NULL,'pegawai1@cendekia.ac.id','pegawai1@cendekia.ac.id'),
  ('rizky.pratama@ui.ac.id','Atomic Habits','Selesai',-41,-40,-35,0,NULL,'pegawai1@cendekia.ac.id','pegawai2@cendekia.ac.id'),
  ('rizky.pratama@ui.ac.id','Sapiens','Selesai',-51,-50,-24,1,NULL,'pegawai2@cendekia.ac.id','pegawai1@cendekia.ac.id'),
  ('rizky.pratama@ui.ac.id','The Hobbit','Menunggu Konfirmasi',0,NULL,NULL,0,NULL,NULL,NULL),
  ('siti.arahma@itb.ac.id','Clean Code','Sedang Dipinjam',-3,-3,NULL,0,NULL,'pegawai1@cendekia.ac.id',NULL),
  ('siti.arahma@itb.ac.id','Sapiens','Perpanjangan Diajukan',-10,-10,NULL,0,NULL,'pegawai2@cendekia.ac.id',NULL),
  ('siti.arahma@itb.ac.id','The Psychology of Money','Menunggu Konfirmasi',0,NULL,NULL,0,NULL,NULL,NULL),
  ('siti.arahma@itb.ac.id','Laskar Pelangi','Selesai',-91,-90,-80,0,NULL,'pegawai1@cendekia.ac.id','pegawai1@cendekia.ac.id'),
  ('ahmad.fauzan@unair.ac.id','Dilan 1990','Sedang Dipinjam',-12,-12,NULL,0,NULL,'pegawai1@cendekia.ac.id',NULL),
  ('ahmad.fauzan@unair.ac.id','Pulang','Ditolak',-20,NULL,NULL,0,'Buku sedang menjalani perawatan sampul. Silakan ajukan kembali minggu depan.','pegawai2@cendekia.ac.id',NULL),
  ('ahmad.fauzan@unair.ac.id','Laskar Pelangi','Selesai',-61,-60,-47,0,NULL,'pegawai2@cendekia.ac.id','pegawai2@cendekia.ac.id'),
  ('dewi.lestari@ipb.ac.id','Filosofi Teras','Selesai',-31,-30,-20,0,NULL,'pegawai1@cendekia.ac.id','pegawai1@cendekia.ac.id'),
  ('dewi.lestari@ipb.ac.id','Bumi Manusia','Selesai',-61,-60,-44,0,NULL,'pegawai2@cendekia.ac.id','pegawai2@cendekia.ac.id'),
  ('budi.santoso88@gmail.com','Negeri 5 Menara','Selesai',-18,-17,-10,0,NULL,'pegawai1@cendekia.ac.id','pegawai2@cendekia.ac.id')
) AS v(email, title, status, req_off, loan_off, ret_off, ext, reason, approver, returner)
JOIN users u ON u.email = v.email
JOIN books b ON b.title = v.title AND b.deleted_at IS NULL
ORDER BY v.req_off, v.email;

-- 2. Riwayat peminjaman dasar untuk SELURUH 96 buku (minimal 2-3 kali per buku, selesai tepat waktu)
WITH borrowers AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id)::int AS b_idx
  FROM users
  WHERE role IN ('mahasiswa', 'umum')
),
book_list AS (
  SELECT id, max_loan_days, ROW_NUMBER() OVER (ORDER BY id)::int AS bk_idx
  FROM books
  WHERE deleted_at IS NULL
),
slots AS (
  SELECT 0 AS s_idx UNION ALL SELECT 1 UNION ALL SELECT 2
)
INSERT INTO loans (user_id, book_id, status, requested_at, loan_date, due_date, returned_at,
                   extension_count, reject_reason, approved_by, returned_confirmed_by)
SELECT
  br.id,
  bk.id,
  'Selesai',
  now() - ((110 + bk.bk_idx + s.s_idx * 35) * INTERVAL '1 day'),
  wita_today() - (109 + bk.bk_idx + s.s_idx * 35),
  wita_today() - (109 + bk.bk_idx + s.s_idx * 35) + bk.max_loan_days,
  wita_today() - (105 + bk.bk_idx + s.s_idx * 35),
  0,
  NULL,
  (SELECT id FROM users WHERE email = CASE WHEN (bk.bk_idx + s.s_idx) % 2 = 0 THEN 'pegawai1@cendekia.ac.id' ELSE 'pegawai2@cendekia.ac.id' END),
  (SELECT id FROM users WHERE email = CASE WHEN (bk.bk_idx + s.s_idx) % 2 = 0 THEN 'pegawai2@cendekia.ac.id' ELSE 'pegawai1@cendekia.ac.id' END)
FROM book_list bk
JOIN slots s ON s.s_idx < (CASE WHEN bk.bk_idx % 2 = 0 THEN 3 ELSE 2 END)
JOIN borrowers br ON br.b_idx = ((bk.bk_idx + s.s_idx * 2) % 6) + 1
WHERE NOT EXISTS (
  SELECT 1 FROM loans l WHERE l.user_id = br.id AND l.book_id = bk.id
);

-- 3. Tambahan riwayat peminjaman untuk buku-buku terpopuler
INSERT INTO loans (user_id, book_id, status, requested_at, loan_date, due_date, returned_at,
                   extension_count, reject_reason, approved_by, returned_confirmed_by)
SELECT
  u.id,
  b.id,
  'Selesai',
  now() - (v.days_ago + 1) * INTERVAL '1 day',
  wita_today() - v.days_ago,
  wita_today() - v.days_ago + b.max_loan_days,
  wita_today() - (v.days_ago - 4),
  0,
  NULL,
  (SELECT id FROM users WHERE email = 'pegawai1@cendekia.ac.id'),
  (SELECT id FROM users WHERE email = 'pegawai2@cendekia.ac.id')
FROM (VALUES
  -- Laskar Pelangi (+6 -> total 12)
  ('dewi.lestari@ipb.ac.id', 'Laskar Pelangi', 210),
  ('budi.santoso88@gmail.com', 'Laskar Pelangi', 240),
  ('rina.marlina@yahoo.com', 'Laskar Pelangi', 270),
  ('dewi.lestari@ipb.ac.id', 'Laskar Pelangi', 300),
  ('budi.santoso88@gmail.com', 'Laskar Pelangi', 330),
  ('rina.marlina@yahoo.com', 'Laskar Pelangi', 360),
  -- Laut Bercerita (+7 -> total 10)
  ('rizky.pratama@ui.ac.id', 'Laut Bercerita', 195),
  ('siti.arahma@itb.ac.id', 'Laut Bercerita', 225),
  ('ahmad.fauzan@unair.ac.id', 'Laut Bercerita', 255),
  ('dewi.lestari@ipb.ac.id', 'Laut Bercerita', 285),
  ('budi.santoso88@gmail.com', 'Laut Bercerita', 315),
  ('rina.marlina@yahoo.com', 'Laut Bercerita', 345),
  ('rizky.pratama@ui.ac.id', 'Laut Bercerita', 375),
  -- Atomic Habits (+5 -> total 9)
  ('siti.arahma@itb.ac.id', 'Atomic Habits', 200),
  ('ahmad.fauzan@unair.ac.id', 'Atomic Habits', 235),
  ('dewi.lestari@ipb.ac.id', 'Atomic Habits', 265),
  ('budi.santoso88@gmail.com', 'Atomic Habits', 295),
  ('rina.marlina@yahoo.com', 'Atomic Habits', 325),
  -- Sapiens (+3 -> total 8)
  ('ahmad.fauzan@unair.ac.id', 'Sapiens', 215),
  ('dewi.lestari@ipb.ac.id', 'Sapiens', 250),
  ('budi.santoso88@gmail.com', 'Sapiens', 290),
  -- Clean Code (+3 -> total 7)
  ('rizky.pratama@ui.ac.id', 'Clean Code', 205),
  ('ahmad.fauzan@unair.ac.id', 'Clean Code', 245),
  ('budi.santoso88@gmail.com', 'Clean Code', 280),
  -- Bumi Manusia (+2 -> total 6)
  ('rizky.pratama@ui.ac.id', 'Bumi Manusia', 220),
  ('siti.arahma@itb.ac.id', 'Bumi Manusia', 260),
  -- The Psychology of Money (+2 -> total 5)
  ('rizky.pratama@ui.ac.id', 'The Psychology of Money', 230),
  ('dewi.lestari@ipb.ac.id', 'The Psychology of Money', 275),
  -- Filosofi Teras (+2 -> total 5)
  ('siti.arahma@itb.ac.id', 'Filosofi Teras', 240),
  ('budi.santoso88@gmail.com', 'Filosofi Teras', 285)
) AS v(email, title, days_ago)
JOIN users u ON u.email = v.email
JOIN books b ON b.title = v.title AND b.deleted_at IS NULL;

-- Riwayat perpanjangan: satu Disetujui, satu Ditolak, satu masih Diajukan
INSERT INTO loan_extensions (loan_id, status, requested_at, old_due_date, new_due_date, processed_by, processed_at, note)
SELECT l.id, v.status, now() + v.req_off * INTERVAL '1 day',
       l.loan_date + b.max_loan_days * v.base_mult,
       CASE WHEN v.status = 'Disetujui' THEN l.loan_date + b.max_loan_days * (v.base_mult + 1) END,
       CASE WHEN v.status = 'Diajukan' THEN NULL ELSE (SELECT id FROM users WHERE email = 'pegawai1@cendekia.ac.id') END,
       CASE WHEN v.status = 'Diajukan' THEN NULL ELSE now() + v.req_off * INTERVAL '1 day' END,
       v.note
FROM (VALUES
  ('rizky.pratama@ui.ac.id','Sapiens','Disetujui',-40,1,NULL),
  ('rizky.pratama@ui.ac.id','Atomic Habits','Ditolak',-36,1,'Buku sedang banyak diminati. Mohon dikembalikan sesuai jatuh tempo.'),
  ('siti.arahma@itb.ac.id','Sapiens','Diajukan',-1,1,NULL)
) AS v(email, title, status, req_off, base_mult, note)
JOIN users u ON u.email = v.email
JOIN books b ON b.title = v.title
JOIN loans l ON l.user_id = u.id AND l.book_id = b.id
  AND ((v.status = 'Diajukan' AND l.status = 'Perpanjangan Diajukan') OR (v.status <> 'Diajukan' AND l.status = 'Selesai'));

-- Denda: dihitung dari keterlambatan pengembalian (dua transaksi di atas terlambat).
--   Filosofi Teras (Dewi): terlambat 3 hari x Rp 1.000 = Rp 3.000 -> Tertunggak (memicu blokir)
--   Bumi Manusia   (Dewi): terlambat 2 hari x Rp 1.000 = Rp 2.000 -> Lunas
INSERT INTO fines (loan_id, user_id, late_days, fine_per_day, amount, status, created_at, paid_at, recorded_by)
SELECT l.id, l.user_id, (l.returned_at - l.due_date), b.fine_per_day, (l.returned_at - l.due_date) * b.fine_per_day,
       CASE WHEN b.title = 'Bumi Manusia' THEN 'Lunas' ELSE 'Tertunggak' END,
       now() + (l.returned_at - wita_today()) * INTERVAL '1 day',
       CASE WHEN b.title = 'Bumi Manusia' THEN now() - INTERVAL '43 days' END,
       CASE WHEN b.title = 'Bumi Manusia' THEN (SELECT id FROM users WHERE email = 'pegawai1@cendekia.ac.id') END
FROM loans l JOIN books b ON b.id = l.book_id
WHERE l.status = 'Selesai' AND l.returned_at > l.due_date;

-- 4. Ulasan contoh utama
INSERT INTO reviews (loan_id, book_id, user_id, rating, comment, created_at)
SELECT DISTINCT ON (u.id, b.id)
       l.id, l.book_id, l.user_id, v.rating, v.comment, now() + v.off * INTERVAL '1 day'
FROM (VALUES
  ('rizky.pratama@ui.ac.id','Laskar Pelangi',5,'Kisah persahabatan dan perjuangan yang sangat menyentuh. Cocok dibaca semua usia.',-24),
  ('rizky.pratama@ui.ac.id','Sapiens',4,'Rangkuman sejarah manusia yang mudah dipahami, walau agak tebal.',-23),
  ('siti.arahma@itb.ac.id','Laskar Pelangi',4,'Bahasanya indah, ceritanya mengalir. Saya sampai ingin membacanya lagi.',-79),
  ('ahmad.fauzan@unair.ac.id','Laskar Pelangi',5,'Novel yang membuat saya kembali semangat belajar.',-46),
  ('dewi.lestari@ipb.ac.id','Bumi Manusia',4,'Sejarah yang dikemas dalam cerita. Butuh waktu, tetapi sangat layak dibaca.',-43)
) AS v(email, title, rating, comment, off)
JOIN users u ON u.email = v.email
JOIN books b ON b.title = v.title
JOIN loans l ON l.user_id = u.id AND l.book_id = b.id AND l.status = 'Selesai'
ORDER BY u.id, b.id, l.id;

-- 5. Ulasan otomatis untuk SELURUH 96 buku (menghasilkan rata-rata rating 3.5 sampai 5.0 di setiap buku)
WITH completed_loans AS (
  SELECT DISTINCT ON (l.book_id, l.user_id)
    l.id AS loan_id,
    l.book_id,
    l.user_id,
    l.returned_at,
    b.title
  FROM loans l
  JOIN books b ON b.id = l.book_id
  WHERE l.status = 'Selesai'
    AND b.deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.loan_id = l.id)
    AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.book_id = l.book_id AND r.user_id = l.user_id)
  ORDER BY l.book_id, l.user_id, l.id
),
ranked_reviews AS (
  SELECT
    cl.*,
    ROW_NUMBER() OVER (PARTITION BY cl.book_id ORDER BY cl.loan_id)::int AS rn
  FROM completed_loans cl
),
scored AS (
  SELECT
    rr.*,
    CASE
      WHEN rr.title IN ('Laskar Pelangi', 'Laut Bercerita', 'Atomic Habits', 'Sapiens', 'Clean Code') THEN
        CASE WHEN rr.rn % 3 = 0 THEN 4 ELSE 5 END
      WHEN rr.book_id % 6 = 0 THEN 5                                        -- Rata-rata 5.0
      WHEN rr.book_id % 6 = 1 THEN CASE WHEN rr.rn % 2 = 1 THEN 4 ELSE 3 END -- Rata-rata 3.5 - 3.7
      WHEN rr.book_id % 6 = 2 THEN CASE WHEN rr.rn = 1 THEN 5 ELSE 4 END     -- Rata-rata 4.3 - 4.5
      WHEN rr.book_id % 6 = 3 THEN 4                                         -- Rata-rata 4.0
      WHEN rr.book_id % 6 = 4 THEN CASE WHEN rr.rn <= 2 THEN 4 ELSE 3 END    -- Rata-rata 3.7 - 4.0
      ELSE CASE WHEN rr.rn = 1 THEN 5 ELSE 4 END                             -- Rata-rata 4.3 - 4.5
    END AS rating
  FROM ranked_reviews rr
  WHERE rr.rn <= 3
)
INSERT INTO reviews (loan_id, book_id, user_id, rating, comment, created_at)
SELECT
  s.loan_id,
  s.book_id,
  s.user_id,
  s.rating,
  CASE s.rating
    WHEN 5 THEN 'Buku yang sangat inspiratif dan mudah dipahami. Sangat direkomendasikan untuk dibaca!'
    WHEN 4 THEN 'Isinya menarik dan menambah wawasan, penyampaian bahasanya juga enak diikuti.'
    ELSE 'Cukup bagus sebagai bahan bacaan dan referensi tambahan.'
  END,
  COALESCE(s.returned_at::timestamp, now()) + INTERVAL '10 hours'
FROM scored s;

-- Pengumuman: campuran Draft dan Published pada tiga kategori.
INSERT INTO announcements (title, content, category, release_date, status, author_id)
SELECT v.title, v.content, v.category, wita_today() + v.off, v.status, (SELECT id FROM users WHERE email = v.author)
FROM (VALUES
  ('Jam Layanan Perpustakaan Selama Masa Ujian',
   E'Selama masa ujian, perpustakaan buka lebih lama agar mahasiswa dapat belajar dengan nyaman.\n\nJam layanan: Senin sampai Kamis pukul 08.00 sampai 20.00 WITA, Jumat pukul 08.00 sampai 17.00 WITA, dan Sabtu pukul 09.00 sampai 14.00 WITA. Perpustakaan tutup pada hari Minggu dan hari libur nasional.\n\nMeja sirkulasi berhenti menerima pengembalian 30 menit sebelum perpustakaan tutup.',
   'Operasional', -2, 'Published', 'pegawai1@cendekia.ac.id'),
  ('Tambahan Koleksi: Sastra, Sains, dan Teknologi',
   E'Perpustakaan Cendekia menambah koleksi baru, antara lain karya sastra Indonesia, buku sains populer, dan buku pemrograman terkini.\n\nCari judul-judul terbaru melalui halaman Katalog, lalu ajukan peminjaman langsung dari halaman detail buku. Silakan datang ke meja sirkulasi untuk mengambil buku setelah pengajuan Anda disetujui.',
   'Layanan', -5, 'Published', 'pegawai2@cendekia.ac.id'),
  ('Bedah Buku Laut Bercerita',
   E'Ikuti diskusi bedah buku Laut Bercerita bersama dosen dan pegiat literasi kampus. Acara terbuka untuk seluruh mahasiswa dan gratis.\n\nTempat: ruang baca lantai 2. Peserta yang hadir mendapat kesempatan meminjam buku tanpa antre pada hari acara.',
   'Acara', -1, 'Published', 'pegawai1@cendekia.ac.id'),
  ('Aturan Denda dan Cara Pembayaran',
   E'Keterlambatan pengembalian dikenakan denda per hari sesuai tarif pada halaman detail buku. Pengembalian pada hari jatuh tempo tidak dikenakan denda.\n\nDenda dibayar tunai di meja sirkulasi. Selama masih ada denda yang belum lunas, pengajuan pinjaman baru tidak dapat dilakukan.',
   'Layanan', -10, 'Published', 'pegawai2@cendekia.ac.id'),
  ('Peresmian Ruang Baca Digital',
   E'Ruang baca digital akan diresmikan pekan depan. Informasi lengkap menyusul.',
   'Acara', 7, 'Published', 'pegawai1@cendekia.ac.id'),
  ('Pelatihan Penelusuran Literatur (Draft)',
   E'Draf pengumuman pelatihan penelusuran literatur ilmiah. Jadwal dan tempat masih disusun dan belum dipublikasikan.',
   'Acara', 3, 'Draft', 'pegawai2@cendekia.ac.id')
) AS v(title, content, category, off, status, author);

-- Reservasi: Rizky mengantre untuk Dilan 1990 yang stoknya habis
INSERT INTO reservations (book_id, user_id, status, created_at)
SELECT b.id, u.id, 'Menunggu', now() - INTERVAL '1 day'
FROM users u, books b WHERE u.email = 'rizky.pratama@ui.ac.id' AND b.title = 'Dilan 1990';

-- Notifikasi untuk beberapa pengguna
INSERT INTO notifications (user_id, type, message, is_read, created_at)
SELECT u.id, v.type, v.msg, v.is_read, now() + v.off * INTERVAL '1 hour'
FROM (VALUES
  ('siti.arahma@itb.ac.id','Persetujuan','Pengajuan pinjaman buku Clean Code disetujui. Silakan ambil bukunya di meja sirkulasi.',FALSE,-70),
  ('ahmad.fauzan@unair.ac.id','Penolakan','Pengajuan pinjaman buku Pulang ditolak. Alasan: Buku sedang menjalani perawatan sampul.',TRUE,-470),
  ('dewi.lestari@ipb.ac.id','Denda','Denda baru tercatat untuk buku Filosofi Teras sebesar Rp 3.000. Mohon lunasi di meja sirkulasi.',FALSE,-480)
) AS v(email, type, msg, is_read, off)
JOIN users u ON u.email = v.email;

-- SINKRONISASI STOK: stok tersedia = stok total - eksemplar yang sedang dipinjam
--     (Sedang Dipinjam + Perpanjangan Diajukan). Memenuhi aturan BR-01 dan BR-02.

UPDATE books b
SET available_stock = b.total_stock - (
      SELECT COUNT(*) FROM loans l
      WHERE l.book_id = b.id AND l.status IN ('Sedang Dipinjam','Perpanjangan Diajukan'));