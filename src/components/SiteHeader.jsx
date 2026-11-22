"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { logout } from "@/actions/auth";
import { btn, cx } from "@/lib/styles";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog Buku" },
  { href: "/pengumuman", label: "Pengumuman" },
];
const HOME = { admin: "/admin/dashboard", pegawai: "/pegawai/dashboard", mahasiswa: "/mahasiswa/dashboard", umum: "/mahasiswa/dashboard" };
const ROLE = { admin: "Admin", pegawai: "Pegawai", mahasiswa: "Mahasiswa", umum: "Pengunjung Umum" };

export default function SiteHeader({ user }) {
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

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const auth = user ? (
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
  ) : (
    <>
      <Link href="/login" className={btn("outline", "sm")}>Masuk</Link>
      <Link href="/register" className={btn("primary", "sm")}>Daftar</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-n-200 bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-[1200px] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-auto no-underline lg:mr-0" aria-label="Perpustakaan Cendekia, ke Beranda">
          <Logo size={32} />
        </Link>
        <nav className="hidden gap-1 lg:mr-auto lg:ml-4 lg:flex" aria-label="Menu utama">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cx(
                "relative rounded-md px-3.5 py-2.5 font-semibold whitespace-nowrap no-underline hover:bg-navy-50 hover:text-navy-800 hover:no-underline",
                isActive(l.href) ? "text-navy-800 after:absolute after:right-3.5 after:bottom-0.5 after:left-3.5 after:h-[3px] after:rounded-[3px] after:bg-yellow-500 after:content-['']" : "text-n-700"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 lg:flex">
          {user && (
            <span className="flex flex-col text-right text-sm leading-tight" title={user.full_name}>
              <b>{user.full_name.split(" ")[0]}</b>
              <small className="text-n-700">{ROLE[user.role]}</small>
            </span>
          )}
          {auth}
        </div>
        <button
          type="button"
          className="inline-flex size-12 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-navy-800 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          aria-expanded={open}
        >
          <Menu size={26} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 animate-fade bg-navy-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 right-0 bottom-0 flex w-[min(340px,88vw)] animate-slide-left flex-col gap-3.5 overflow-y-auto bg-white px-5 pt-4 pb-6 shadow-lg" role="dialog" aria-modal="true" aria-label="Menu navigasi">
            <div className="flex items-center justify-between">
              <Logo size={30} />
              <button type="button" className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-navy-800 hover:bg-navy-50" onClick={() => setOpen(false)} aria-label="Tutup menu">
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            {user && (
              <p className="m-0 rounded-md bg-navy-50 px-3 py-2.5 text-[0.9375rem]">
                Masuk sebagai <b>{user.full_name}</b> ({ROLE[user.role]})
              </p>
            )}
            <nav className="flex flex-col gap-1" aria-label="Menu utama">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cx("rounded-md p-3.5 text-[1.0625rem] font-semibold text-navy-800 no-underline", isActive(l.href) && "bg-navy-100 shadow-[inset_4px_0_0_var(--color-yellow-500)]")}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2.5 [&>a]:w-full">{auth}</div>
          </aside>
        </div>
      )}
    </header>
  );
}