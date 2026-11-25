"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Bell, ChevronDown, History, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { inisial } from "@/lib/format";
import { cx } from "@/lib/styles";

const ROLE_TEXT = {
    mahasiswa: "Mahasiswa",
    umum: "Pengunjung Umum",
};

export default function UserMenu({ user, unread = 0 }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [prevPathname, setPrevPathname] = useState(pathname);
    const wrapRef = useRef(null);

    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setOpen(false);
    }

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
        if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
        document.removeEventListener("mousedown", onDown);
        window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const initials = inisial(user.full_name);

    return (
        <div className="flex items-center gap-2">
        {/* Ikon lonceng notifikasi dengan badge jumlah belum dibaca */}
        <Link
            href="/pengunjung/notifikasi"
            aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
            className={cx(
            "relative inline-flex size-10 items-center justify-center rounded-full border border-n-200 bg-white text-navy-800 no-underline transition hover:bg-navy-50 hover:no-underline",
            pathname.startsWith("/pengunjung/notifikasi") && "border-navy-800 bg-navy-50"
            )}
        >
            <Bell size={19} aria-hidden="true" />
            {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow-500 px-1 text-[0.6875rem] leading-none font-bold text-navy-900 shadow-sm">
                {unread > 99 ? "99+" : unread}
            </span>
            )}
        </Link>

        {/* Pil avatar inisial + dropdown akun */}
        <div ref={wrapRef} className="relative">
            <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label="Menu akun pengguna"
            className={cx(
                "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-n-200 bg-navy-50/70 pr-2.5 pl-1.5 text-navy-800 transition hover:border-navy-600/40 hover:bg-navy-50",
                open && "border-navy-800 bg-navy-50"
            )}
            >
            <span className="grid size-7 place-items-center rounded-full bg-navy-800 font-heading text-xs font-bold tracking-wide text-white">
                {initials}
            </span>
            <ChevronDown
                size={15}
                aria-hidden="true"
                className={cx("text-n-700 transition-transform duration-150", open && "rotate-180")}
            />
            </button>

            {open && (
            <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-toast-in overflow-hidden rounded-xl border border-n-200 bg-white shadow-lg"
            >
                {/* Identitas pengguna */}
                <div className="bg-navy-50/60 px-4 py-3">
                <p className="m-0 truncate text-[0.9375rem] font-bold text-navy-800">{user.full_name}</p>
                {user.email && <p className="mt-0.5 mb-1.5 truncate text-xs text-n-700">{user.email}</p>}
                <span className="inline-block rounded-full bg-navy-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-navy-800">
                    {ROLE_TEXT[user.role] || "Anggota"}
                </span>
                </div>

                {/* Menu navigasi anggota */}
                <div className="border-t border-n-200 py-1.5">
                <Link
                    href="/pengunjung/dashboard"
                    role="menuitem"
                    className={cx(
                    "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-n-900 no-underline transition hover:bg-navy-50 hover:text-navy-800 hover:no-underline",
                    pathname === "/pengunjung/dashboard" && "bg-navy-50 font-semibold text-navy-800"
                    )}
                >
                    <ArrowLeftRight size={17} className="shrink-0 text-navy-700" aria-hidden="true" />
                    <span>Pinjaman Saya</span>
                </Link>

                <Link
                    href="/pengunjung/riwayat"
                    role="menuitem"
                    className={cx(
                    "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-n-900 no-underline transition hover:bg-navy-50 hover:text-navy-800 hover:no-underline",
                    pathname.startsWith("/pengunjung/riwayat") && "bg-navy-50 font-semibold text-navy-800"
                    )}
                >
                    <History size={17} className="shrink-0 text-navy-700" aria-hidden="true" />
                    <span>Riwayat Pinjam</span>
                </Link>

                <Link
                    href="/pengunjung/notifikasi"
                    role="menuitem"
                    className={cx(
                    "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-n-900 no-underline transition hover:bg-navy-50 hover:text-navy-800 hover:no-underline",
                    pathname.startsWith("/pengunjung/notifikasi") && "bg-navy-50 font-semibold text-navy-800"
                    )}
                >
                    <Bell size={17} className="shrink-0 text-navy-700" aria-hidden="true" />
                    <span className="flex-1">Notifikasi</span>
                    {unread > 0 && (
                    <span className="rounded-full bg-yellow-500 px-1.5 py-0.5 text-[0.6875rem] leading-none font-bold text-navy-900">
                        {unread}
                    </span>
                    )}
                </Link>
                </div>

                {/* Tombol keluar */}
                <div className="border-t border-n-200 py-1.5">
                <form action={logout}>
                    <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 text-left font-[inherit] text-sm font-medium text-red-600 transition hover:bg-red-100/60"
                    >
                    <LogOut size={17} className="shrink-0" aria-hidden="true" />
                    <span>Keluar akun</span>
                    </button>
                </form>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}