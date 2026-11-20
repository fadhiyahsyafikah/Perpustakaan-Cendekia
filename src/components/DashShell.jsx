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

const SIDE_BASE = "relative flex min-h-[46px] w-full cursor-pointer items-center gap-3 rounded-md border-0 px-3 text-left font-[inherit] text-[0.9375rem] no-underline hover:no-underline";
const SIDE_IDLE = "bg-transparent font-medium text-navy-100 hover:bg-navy-700 hover:text-white";
const SIDE_ON = "bg-navy-700 font-semibold text-white shadow-[inset_4px_0_0_var(--color-yellow-500)]";
const SIDE_ITEM = cx(SIDE_BASE, SIDE_IDLE);
const COUNT = "inline-grid place-items-center rounded-full bg-yellow-500 px-1.5 font-bold text-navy-800 not-italic";

export default function DashShell({ user, menu, counts = {}, unread = 0, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
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
      <div className="px-2 pt-1 pb-2">
        <Logo light size={32} />
      </div>
      <p className="m-0 grid gap-0.5 rounded-md bg-navy-700 p-3 text-sm">
        <span className="text-xs text-[#c9ccf3]">Masuk sebagai</span>
        <b>{user.full_name}</b>
        <em className="text-[0.8125rem] font-semibold text-yellow-500 not-italic">{ROLE[user.role]}</em>
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
              <Icon size={20} aria-hidden="true" />
              <span>{m.label}</span>
              {n > 0 && <i className={cx(COUNT, "ml-auto h-[22px] min-w-[22px] text-xs")} aria-label={`${n} baru`}>{n}</i>}
            </Link>
          );
        })}
      </nav>
      <div className="grid gap-0.5 border-t border-white/15 pt-2.5">
        <Link href="/" className={SIDE_ITEM}>
          <Globe size={20} aria-hidden="true" /> Lihat situs publik
        </Link>
        <form action={logout}>
          <button type="submit" className={SIDE_ITEM}>
            <LogOut size={20} aria-hidden="true" /> Keluar
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 bg-n-50 lg:grid-cols-[240px_1fr]">
      <a href="#konten" className="absolute -top-16 left-2 z-[200] rounded-md bg-navy-800 px-[18px] py-3 font-semibold text-white focus:top-2">Lewati ke konten</a>
      <aside className="sticky top-0 hidden h-screen flex-col gap-3.5 overflow-y-auto bg-navy-800 px-3.5 py-5 text-white lg:flex" aria-label="Navigasi dashboard">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 animate-fade bg-navy-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 bottom-0 left-0 z-[2] flex w-[min(300px,86vw)] animate-slide-right flex-col gap-3.5 overflow-y-auto bg-navy-800 px-3.5 py-5 text-white" role="dialog" aria-modal="true" aria-label="Menu dashboard">
            <button type="button" className="absolute top-2 right-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white hover:bg-navy-700" onClick={() => setOpen(false)} aria-label="Tutup menu">
              <X size={24} aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex min-h-16 items-center gap-2 border-b border-n-200 bg-white px-3 py-2 lg:px-8">
          <button type="button" className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-navy-800 hover:bg-navy-50 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu" aria-expanded={open}>
            <Menu size={26} aria-hidden="true" />
          </button>
          <p className="m-0 flex flex-1 flex-wrap items-center gap-2 text-[0.9375rem]">
            Halo, <b>{user.full_name.split(" ")[0]}</b>
            <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{ROLE[user.role]}</span>
          </p>
          <div className="flex items-center gap-2">
            {["mahasiswa", "umum"].includes(user.role) && (
              <Link href="/mahasiswa/notifikasi" className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-navy-800 hover:bg-navy-50" aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ""}`}>
                <Bell size={22} aria-hidden="true" />
                {unread > 0 && <i className={cx(COUNT, "absolute top-0.5 right-0 h-[18px] min-w-[18px] text-[0.6875rem]")}>{unread}</i>}
              </Link>
            )}
          </div>
        </header>
        <main id="konten" className="w-full max-w-[1280px] px-4 pt-5 pb-12 outline-none lg:px-8 lg:pt-8 lg:pb-14" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}