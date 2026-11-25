// Menu sidebar per role staf. "icon" adalah kunci ikon (dipetakan di DashShell).
export const MENUS = {
    pegawai: [
        { href: "/pegawai/dashboard", label: "Dashboard", icon: "dashboard" },
        { href: "/pegawai/peminjaman", label: "Antrean Peminjaman", icon: "clipboard", countKey: "pending" },
        { href: "/pegawai/pengembalian", label: "Meja Layanan", icon: "return" },
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