// Konfigurasi bawaan aplikasi, Nilai ini dapat diubah di satu tempat.
export const CONFIG = {
    MAX_ACTIVE_LOANS: 3, // BR-04 (asumsi, dapat diubah)
    MAX_EXTENSIONS: 1, // BR-06 (asumsi, dapat diubah)
    MAX_COVER_BYTES: 2 * 1024 * 1024, // 2 MB
    MAX_COMMENT: 500,
    PAGE_SIZE: 12,
    ADMIN_PAGE_SIZE: 15,
    RESERVATION_HOLD_DAYS: 2,
    SESSION_COOKIE: "cendekia_session",
    SESSION_HOURS: 8,
    TIMEZONE: process.env.APP_TIMEZONE || "Asia/Makassar",
};

// Status dan enum (harus persis sama dengan CHECK constraint di database)
export const LOAN_STATUS = {
    MENUNGGU: "Menunggu Konfirmasi",
    DIPINJAM: "Sedang Dipinjam",
    PERPANJANGAN: "Perpanjangan Diajukan",
    DITOLAK: "Ditolak",
    SELESAI: "Selesai",
};
export const ACTIVE_LOAN_STATUSES = [LOAN_STATUS.MENUNGGU, LOAN_STATUS.DIPINJAM, LOAN_STATUS.PERPANJANGAN];
export const BORROWED_STATUSES = [LOAN_STATUS.DIPINJAM, LOAN_STATUS.PERPANJANGAN];
export const ROLES = ["admin", "pegawai", "mahasiswa", "umum"];
export const ROLE_LABEL = { admin: "Admin", pegawai: "Pegawai Perpustakaan", mahasiswa: "Mahasiswa", umum: "Pengunjung Umum" };
// Peran yang boleh meminjam buku, menulis ulasan, dan punya dashboard anggota
export const BORROWER_ROLES = ["mahasiswa", "umum"];
export const isBorrower = (role) => BORROWER_ROLES.includes(role);
// Label nomor identitas per peran (NIM mahasiswa, NIP pegawai/admin, ID/NIK pengunjung umum)
export const ID_LABEL = { mahasiswa: "NIM", pegawai: "NIP", admin: "NIP", umum: "ID" };
export const idLabel = (role) => ID_LABEL[role] || "ID";
export const ANNOUNCEMENT_CATEGORIES = ["Operasional", "Layanan", "Acara"];
export const ANNOUNCEMENT_STATUSES = ["Draft", "Published"];

export const HOME_BY_ROLE = {
    admin: "/admin/dashboard",
    pegawai: "/pegawai/dashboard",
    mahasiswa: "/mahasiswa/dashboard",
    umum: "/mahasiswa/dashboard",
};

// Domain email kampus (dapat dikonfigurasi lewat .env)
export function campusDomains() {
    return (process.env.CAMPUS_EMAIL_DOMAIN || "ac.id")
        .split(",")
        .map((d) => d.trim().replace(/^[@.]+/, "").toLowerCase())
        .filter(Boolean);
}
export function isCampusEmail(email) {
    const domain = String(email).toLowerCase().split("@")[1] || "";
    return campusDomains().some((d) => domain === d || domain.endsWith("." + d));
}
