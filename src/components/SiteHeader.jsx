"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Bell, History, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { logout } from "@/actions/auth";
import { inisial } from "@/lib/format";
import { btn, cx } from "@/lib/styles";

const PUBLIC_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog Buku" },
  { href: "/pengumuman", label: "Pengumuman" },
];

const HOME = {
  admin: "/admin/dashboard",
  pegawai: "/pegawai/dashboard",
  mahasiswa: "/pengunjung/dashboard",
  umum: "/pengunjung/dashboard",
};
const ROLE = { admin: "Admin", pegawai: "Pegawai", mahasiswa: "Mahasiswa", umum: "Pengunjung Umum" };

export default function SiteHeader({ user, unread = 0 }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isMember = user && (user.role === "mahasiswa" || user.role === "umum");
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const auth = user ? (
    isMember ? (
      <UserMenu user={user} unread={unread} />
    ) : (
      <>
        <Link href={HOME[user.role]} className={btn("primary", "sm")}>
          <LayoutDashboard size={18} aria-hidden="true" /> Dashboard
        </Link>
        <form action={logout} className="max-lg:w-full">
          <button type="submit" className={btn("outline", "sm", false, "max-lg:w-full")}>
            <LogOut size={18} aria-hidden="true" /> Keluar
          </button>
        </form>
      </>
    )
  ) : (
    <>
      <Link href="/login" className={btn("outline", "sm")}>Masuk</Link>
      <Link href="/register" className={btn("primary", "sm")}>Daftar</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-n-200 bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link href="/" className="justify-self-start no-underline" aria-label="Perpustakaan Cendekia, ke Beranda">
          <Logo size={32} />
        </Link>

        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Menu utama">
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cx(
                "relative rounded-md px-3.5 py-2.5 font-semibold whitespace-nowrap no-underline hover:bg-navy-50 hover:text-navy-800 hover:no-underline",
                isActive(l.href)
                  ? "text-navy-800 after:absolute after:right-3.5 after:bottom-0.5 after:left-3.5 after:h-[3px] after:rounded-[3px] after:bg-yellow-500 after:content-['']"
                  : "text-n-700"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2.5 lg:flex">
          {user && !isMember && (
            <span className="flex flex-col text-right text-sm leading-tight" title={user.full_name}>
              <b>{user.full_name.split(" ")[0]}</b>
              <small className="text-n-700">{ROLE[user.role]}</small>
            </span>
          )}
          {auth}
        </div>

        {/* Kontrol mobile: ikon lonceng cepat (untuk anggota) + tombol burger */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {isMember && (
            <Link
              href="/pengunjung/notifikasi"
              aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
              className="relative inline-flex size-10 items-center justify-center rounded-full border border-n-200 bg-white text-navy-800 no-underline hover:bg-navy-50"
            >
              <Bell size={19} aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow-500 px-1 text-[0.6875rem] leading-none font-bold text-navy-900">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-navy-800 hover:bg-navy-50"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            aria-expanded={open}
          >
            <Menu size={26} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 animate-fade bg-navy-900/50" onClick={() => setOpen(false)} />
          <aside
            className="absolute top-0 right-0 bottom-0 flex w-[min(340px,88vw)] animate-slide-left flex-col gap-3.5 overflow-y-auto bg-white px-5 pt-4 pb-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
          >
            <div className="flex items-center justify-between">
              <Logo size={30} />
              <button
                type="button"
                className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-navy-800 hover:bg-navy-50"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 rounded-xl bg-navy-50 px-3.5 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-800 font-heading text-sm font-bold text-white">
                  {inisial(user.full_name)}
                </span>
                <div className="min-w-0">
                  <b className="block truncate text-sm text-navy-800">{user.full_name}</b>
                  {user.email && <small className="block truncate text-xs text-n-700">{user.email}</small>}
                  <span className="mt-1 inline-block rounded-full bg-navy-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-navy-800">
                    {ROLE[user.role]}
                  </span>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1" aria-label="Menu utama">
              {PUBLIC_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cx(
                    "rounded-md p-3 text-base font-semibold text-navy-800 no-underline",
                    isActive(l.href) && "bg-navy-100 shadow-[inset_4px_0_0_var(--color-yellow-500)]"
                  )}
                >
                  {l.label}
                </Link>
              ))}

              {isMember && (
                <>
                  <div className="my-1.5 border-t border-n-200" />
                  <Link
                    href="/pengunjung/dashboard"
                    className={cx(
                      "flex items-center gap-2.5 rounded-md p-3 text-base font-semibold text-navy-800 no-underline",
                      pathname === "/pengunjung/dashboard" && "bg-navy-100 shadow-[inset_4px_0_0_var(--color-yellow-500)]"
                    )}
                  >
                    <ArrowLeftRight size={18} aria-hidden="true" />
                    <span>Pinjaman Saya</span>
                  </Link>
                  <Link
                    href="/pengunjung/riwayat"
                    className={cx(
                      "flex items-center gap-2.5 rounded-md p-3 text-base font-semibold text-navy-800 no-underline",
                      pathname.startsWith("/pengunjung/riwayat") && "bg-navy-100 shadow-[inset_4px_0_0_var(--color-yellow-500)]"
                    )}
                  >
                    <History size={18} aria-hidden="true" />
                    <span>Riwayat Pinjam</span>
                  </Link>
                  <Link
                    href="/pengunjung/notifikasi"
                    className={cx(
                      "flex items-center gap-2.5 rounded-md p-3 text-base font-semibold text-navy-800 no-underline",
                      pathname.startsWith("/pengunjung/notifikasi") && "bg-navy-100 shadow-[inset_4px_0_0_var(--color-yellow-500)]"
                    )}
                  >
                    <Bell size={18} aria-hidden="true" />
                    <span className="flex-1">Notifikasi</span>
                    {unread > 0 && (
                      <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-navy-900">
                        {unread}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-auto flex flex-col gap-2.5 border-t border-n-200 pt-3 [&>a]:w-full">
              {isMember ? (
                <form action={logout} className="w-full">
                  <button type="submit" className={btn("outline", "sm", true, "text-red-600! border-red-600/30! hover:bg-red-100/50!")}>
                    <LogOut size={18} aria-hidden="true" /> Keluar akun
                  </button>
                </form>
              ) : (
                auth
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}