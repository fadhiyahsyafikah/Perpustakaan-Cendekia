"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell, BookCopy, ClipboardCheck, Download, Globe, History, LayoutDashboard, Library, ListChecks,
  LogOut, Megaphone, Menu, RefreshCw, RotateCcw, Tags, Users, Wallet, X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { logout } from "@/actions/auth";
import { cx } from "@/lib/styles";

const ICONS = {
  dashboard: LayoutDashboard, library: Library, history: History, bell: Bell, megaphone: Megaphone,
  clipboard: ClipboardCheck, return: RotateCcw, refresh: RefreshCw, wallet: Wallet, books: BookCopy,
  users: Users, tags: Tags, list: ListChecks, download: Download,
};
const ROLE = { admin: "Admin", pegawai: "Pegawai Perpustakaan", mahasiswa: "Mahasiswa", umum: "Pengunjung Umum" };

const SIDE_BASE = "relative flex min-h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-md border-0 px-2.5 text-left font-[inherit] text-[0.875rem] no-underline hover:no-underline";
const SIDE_IDLE = "bg-transparent font-medium text-navy-100 hover:bg-navy-700 hover:text-white";
const SIDE_ON = "bg-navy-700 font-semibold text-white shadow-[inset_3px_0_0_var(--color-yellow-500)]";
const SIDE_ITEM = cx(SIDE_BASE, SIDE_IDLE);
const COUNT = "inline-grid place-items-center rounded-full bg-yellow-500 px-1.5 font-bold text-navy-800 not-italic";

export default function DashShell({ user, menu, counts = {}, unread = 0, children }) {
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

  const active = (href) => pathname === href || (href !== "/katalog" && pathname.startsWith(href + "/"));

  const sidebar = (
    <>
      <div className="px-1.5 pt-0.5 pb-1">
        <Logo light size={26} />
      </div>
      <p className="m-0 grid gap-0.5 rounded-md bg-navy-700 px-2.5 py-2 text-xs">
        <span className="text-[0.6875rem] text-[#c9ccf3]">Masuk sebagai</span>
        <b className="truncate text-[0.8125rem]">{user.full_name}</b>
        <em className="text-[0.75rem] font-semibold text-yellow-500 not-italic">{ROLE[user.role]}</em>
      </p>
      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Menu dashboard">
        {menu.map((m) => {
          const Icon = ICONS[m.icon] || LayoutDashboard;
          const n = m.countKey ? counts[m.countKey] : m.icon === "bell" ? unread : 0;
          const isOn = active(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={isOn ? "page" : undefined}
              className={cx(SIDE_BASE, isOn ? SIDE_ON : SIDE_IDLE)}
            >
              <Icon size={17} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{m.label}</span>
              {n > 0 && <i className={cx(COUNT, "ml-auto h-[18px] min-w-[18px] text-[0.6875rem]")} aria-label={`${n} baru`}>{n}</i>}
            </Link>
          );
        })}
      </nav>
      <div className="grid gap-0.5 border-t border-white/15 pt-2">
        <Link href="/" className={SIDE_ITEM}>
          <Globe size={17} className="shrink-0" aria-hidden="true" /> Pratinjau
        </Link>
        <form action={logout}>
          <button type="submit" className={SIDE_ITEM}>
            <LogOut size={17} className="shrink-0" aria-hidden="true" /> Keluar
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 bg-n-50 lg:grid-cols-[215px_1fr]">
      <a href="#konten" className="absolute -top-16 left-2 z-[200] rounded-md bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white focus:top-2">Lewati ke konten</a>
      <aside className="sticky top-0 hidden h-screen flex-col gap-2.5 overflow-y-auto bg-navy-800 px-3 py-4 text-white lg:flex" aria-label="Navigasi dashboard">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 animate-fade bg-navy-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 bottom-0 left-0 z-[2] flex w-[min(270px,84vw)] animate-slide-right flex-col gap-2.5 overflow-y-auto bg-navy-800 px-3 py-4 text-white" role="dialog" aria-modal="true" aria-label="Menu dashboard">
            <button type="button" className="absolute top-2 right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white hover:bg-navy-700" onClick={() => setOpen(false)} aria-label="Tutup menu">
              <X size={20} aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex min-h-13 items-center gap-2 border-b border-n-200 bg-white px-3 py-1.5 lg:px-6">
          <button type="button" className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-navy-800 hover:bg-navy-50 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu" aria-expanded={open}>
            <Menu size={22} aria-hidden="true" />
          </button>
          <p className="m-0 flex flex-1 flex-wrap items-center gap-2 text-sm">
            Halo, <b>{user.full_name.split(" ")[0]}</b>
            <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-navy-800">{ROLE[user.role]}</span>
          </p>
          <div className="flex items-center gap-2">
            {["mahasiswa", "umum"].includes(user.role) && (
              <Link href="/mahasiswa/notifikasi" className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-navy-800 hover:bg-navy-50" aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ""}`}>
                <Bell size={19} aria-hidden="true" />
                {unread > 0 && <i className={cx(COUNT, "absolute top-0.5 right-0 h-4 min-w-4 text-[0.625rem]")}>{unread}</i>}
              </Link>
            )}
          </div>
        </header>
        <main id="konten" className="w-full max-w-[1200px] px-4 pt-5 pb-10 outline-none lg:px-6 lg:pt-6 lg:pb-12" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}