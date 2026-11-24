// Menu sidebar per role. "icon" adalah kunci ikon (dipetakan di DashShell).
const MEMBER_MENU = [
    { href: "/pengunjung/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/katalog", label: "Cari Buku", icon: "library" },
    { href: "/pengunjung/riwayat", label: "Riwayat Pinjam", icon: "history" },
    { href: "/pengunjung/notifikasi", label: "Notifikasi", icon: "bell" },
    { href: "/pengumuman", label: "Pengumuman", icon: "megaphone" },
];

export const MENUS = {
    mahasiswa: MEMBER_MENU,
    umum: MEMBER_MENU,
    pegawai: [
        { href: "/pegawai/dashboard", label: "Dashboard", icon: "dashboard" },
        { href: "/pegawai/peminjaman", label: "Antrean Peminjaman", icon: "clipboard", countKey: "pending" },
        { href: "/pegawai/pengembalian", label: "Meja Sirkulasi", icon: "return" },
        { href: "/pegawai/perpanjangan", label: "Perpanjangan", icon: "refresh", countKey: "extensions" },
        { href: "/pegawai/denda", label: "Denda", icon: "wallet", countKey: "fines_open" },
        { href: "/kelola/buku", label: "Kelola Buku", icon: "books" },
        { href: "/kelola/pengumuman", label: "Kelola Pengumuman", icon: "megaphone" },
    ],
    
    admin: [
        { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
        { href: "/admin/users", label: "Pengguna", icon: "users" },
        { href: "/admin/kategori", label: "Kategori Buku", icon: "tags" },
        { href: "/kelola/buku", label: "Kelola Buku", icon: "books" },
        { href: "/kelola/pengumuman", label: "Kelola Pengumuman", icon: "megaphone" },
        { href: "/admin/transaksi", label: "Monitoring Transaksi", icon: "list" },
        { href: "/admin/laporan", label: "Laporan (CSV)", icon: "download" },
    ],
};
