import { z } from "zod";
import { isCampusEmail, campusDomains, ASSIGNABLE_ROLES, ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_STATUSES, CONFIG } from "@/lib/config";

// pembantu
const req = (label) => z.string({ required_error: `${label} wajib diisi.`, invalid_type_error: `${label} wajib diisi.` }).trim().min(1, `${label} wajib diisi.`);

const text = (label, max) => req(label).max(max, `${label} maksimal ${max} karakter.`);

// Angka bulat dari teks formulir; kosong dianggap belum diisi (bukan 0)
const int = (label, { min, max } = {}) =>
    z.preprocess(
        (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
        z
        .number({ required_error: `${label} wajib diisi.`, invalid_type_error: `${label} harus berupa angka.` })
        .int(`${label} harus berupa bilangan bulat.`)
        .min(min ?? -Infinity, `${label} minimal ${min}.`)
        .max(max ?? Infinity, `${label} maksimal ${max}.`)
    );

export const email = req("Email")
    .toLowerCase()
    .max(150, "Email maksimal 150 karakter.")
    .email("Format email belum benar, contoh: nama@kampus.ac.id.");

export const campusEmail = email.refine(
    (v) => isCampusEmail(v),
    () => ({ message: `Gunakan email kampus Anda, misalnya nama@kampus.${campusDomains()[0] || "ac.id"}.` })
);

export const password = z
    .string({ required_error: "Password wajib diisi." })
    .min(8, "Password minimal 8 karakter.")
    .max(72, "Password maksimal 72 karakter.")
    .regex(/[A-Za-z]/, "Password harus memuat huruf.")
    .regex(/\d/, "Password harus memuat angka.");

const identity = text("Nomor identitas", 30).regex(/^[A-Za-z0-9./-]+$/, "Nomor identitas hanya boleh huruf, angka, titik, garis miring, atau strip.");

const dateStr = (label) =>
    req(label).regex(/^\d{4}-\d{2}-\d{2}$/, `${label} belum benar.`).refine((v) => !Number.isNaN(Date.parse(v)), `${label} tidak valid.`);

// autentikasi
export const loginSchema = z.object({
    email: req("Email").toLowerCase(),
    password: req("Password"),
});

// Pendaftaran mandiri: Mahasiswa (wajib email kampus) atau Pengunjung Umum (email apa saja)
export const registerSchema = z
    .object({
        account_type: z.enum(["mahasiswa", "umum"], { errorMap: () => ({ message: "Pilih jenis akun." }) }),
        full_name: text("Nama lengkap", 120).min(3, "Nama lengkap minimal 3 karakter."),
        identity_number: identity,
        email,
        password,
        password_confirm: req("Konfirmasi password"),
    })
    .superRefine((d, ctx) => {
        if (d.password !== d.password_confirm) {
            ctx.addIssue({ code: "custom", path: ["password_confirm"], message: "Konfirmasi password tidak sama." });
        }
        if (d.account_type === "mahasiswa" && !isCampusEmail(d.email)) {
            ctx.addIssue({ code: "custom", path: ["email"], message: `Mahasiswa wajib memakai email kampus, misalnya nama@kampus.${campusDomains()[0] || "ac.id"}. Bukan mahasiswa? Pilih jenis akun Pengunjung Umum.` });
        }
    });

// pengguna (Admin) - hanya dapat membuat atau menetapkan peran selain Admin
export const userCreateSchema = z.object({
    full_name: text("Nama lengkap", 120),
    email,
    password,
    role: z.enum(ASSIGNABLE_ROLES, { errorMap: () => ({ message: "Pilih peran yang tersedia." }) }),
    identity_number: identity,
});

export const userUpdateSchema = z.object({
    full_name: text("Nama lengkap", 120),
    email,
    role: z.enum(ASSIGNABLE_ROLES, { errorMap: () => ({ message: "Pilih peran yang tersedia." }) }).optional(),
    is_active: z.enum(["true", "false"]).optional(),
    new_password: z.preprocess((v) => (v === "" ? undefined : v), password.optional()),
});

// kategori
export const categorySchema = z.object({
    name: text("Nama kategori", 80),
    code: text("Kode klasifikasi", 20)
        .toUpperCase()
        .regex(/^[A-Z0-9.-]+$/, "Kode hanya boleh huruf, angka, titik, atau strip."),
    description: z.string().trim().max(500, "Deskripsi maksimal 500 karakter.").optional().default(""),
});

// buku
const coverUrl = z
    .string()
    .trim()
    .max(255, "Tautan sampul maksimal 255 karakter.")
    .refine((v) => v === "" || v.startsWith("/api/covers/") || /^https?:\/\/\S+$/i.test(v), "Tautan sampul harus diawali http:// atau https://.")
    .optional()
    .default("");

const bookBase = {
    title: text("Judul buku", 200),
    author: text("Pengarang", 200),
    publisher: text("Penerbit", 150),
    publish_year: int("Tahun terbit", { min: 1400, max: new Date().getFullYear() }),
    category_id: int("Kategori", { min: 1 }),
    total_stock: int("Jumlah stok", { min: 0, max: 10000 }),
    max_loan_days: int("Durasi maksimal pinjam", { min: 1, max: 90 }),
    fine_per_day: int("Tarif denda per hari", { min: 0, max: 1000000 }),
    cover_url: coverUrl,
};

export const bookCreateSchema = z.object({
    ...bookBase,
    isbn: text("ISBN", 20).regex(/^[0-9Xx-]{10,20}$/, "ISBN hanya berisi angka dan strip (10 sampai 20 karakter)."),
});
export const bookUpdateSchema = z.object(bookBase);

// pengumuman
export const announcementSchema = z.object({
    title: text("Judul pengumuman", 160),
    content: req("Isi pengumuman").max(20000, "Isi pengumuman terlalu panjang."),
    category: z.enum(ANNOUNCEMENT_CATEGORIES, { errorMap: () => ({ message: "Pilih kategori yang tersedia." }) }),
    release_date: dateStr("Tanggal rilis"),
    status: z.enum(ANNOUNCEMENT_STATUSES, { errorMap: () => ({ message: "Pilih status yang tersedia." }) }),
});

// transaksi
export const reasonSchema = z.object({
    reason: req("Alasan").min(5, "Alasan minimal 5 karakter agar jelas bagi peminjam.").max(300, "Alasan maksimal 300 karakter."),
});

export const reviewSchema = z.object({
    rating: int("Rating", { min: 1, max: 5 }),
    comment: z.string().trim().max(CONFIG.MAX_COMMENT, `Komentar maksimal ${CONFIG.MAX_COMMENT} karakter.`).optional().default(""),
});

export const idSchema = int("ID", { min: 1 });