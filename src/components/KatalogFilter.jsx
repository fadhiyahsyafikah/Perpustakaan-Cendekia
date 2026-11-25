"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import MobileCollapse from "@/components/MobileCollapse";
import { btn, ctl, cx } from "@/lib/styles";

const DEBOUNCE_MS = 350;

export default function KatalogFilter({ q, kategori, urut, categories, sortOptions }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const qRef = useRef(null);
    const kategoriRef = useRef(null);
    const urutRef = useRef(null);
    const timerRef = useRef(null);
    const lastSentRef = useRef({ q, kategori, urut });

    // Sinkronkan kontrol saat URL berubah dari luar (mis. tombol Back/Forward atau tautan reset)
    useEffect(() => {
        let synced = false;
        if (qRef.current && q !== lastSentRef.current.q) {
        qRef.current.value = q;
        lastSentRef.current.q = q;
        synced = true;
        }
        if (kategoriRef.current && kategori !== lastSentRef.current.kategori) {
        kategoriRef.current.value = kategori;
        lastSentRef.current.kategori = kategori;
        synced = true;
        }
        if (urutRef.current && urut !== lastSentRef.current.urut) {
        urutRef.current.value = urut;
        lastSentRef.current.urut = urut;
        synced = true;
        }
        if (synced) clearTimeout(timerRef.current);
    }, [q, kategori, urut]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const applyFilters = ({ nextQ, nextKategori, nextUrut, force = false } = {}) => {
        clearTimeout(timerRef.current);
        const qVal = (nextQ ?? qRef.current?.value ?? "").trim();
        const katVal = nextKategori ?? kategoriRef.current?.value ?? "";
        const urutVal = nextUrut ?? urutRef.current?.value ?? "judul";

        if (
        !force &&
        qVal === lastSentRef.current.q &&
        katVal === lastSentRef.current.kategori &&
        urutVal === lastSentRef.current.urut
        ) {
        return;
        }

        lastSentRef.current = { q: qVal, kategori: katVal, urut: urutVal };

        const sp = new URLSearchParams();
        if (qVal) sp.set("q", qVal);
        if (katVal) sp.set("kategori", katVal);
        if (urutVal && urutVal !== "judul") sp.set("urut", urutVal);
        const qs = sp.toString();

        startTransition(() => {
        router.replace(qs ? `/katalog?${qs}` : "/katalog", { scroll: false });
        });
    };

    const handleSearchChange = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
        applyFilters();
        }, DEBOUNCE_MS);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        applyFilters({ force: true });
    };

    const handleReset = () => {
        clearTimeout(timerRef.current);
        if (qRef.current) qRef.current.value = "";
        if (kategoriRef.current) kategoriRef.current.value = "";
        if (urutRef.current) urutRef.current.value = "judul";
        applyFilters({ nextQ: "", nextKategori: "", nextUrut: "judul", force: true });
    };

    return (
        <form
        action="/katalog"
        method="get"
        role="search"
        onSubmit={handleSubmit}
        className="mb-5 rounded-xl border border-n-200 bg-white p-4 shadow-sm"
        >
        <MobileCollapse>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_150px]">
            <div className="relative md:col-span-3 md:row-start-1 [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]">
                {isPending ? (
                <LoaderCircle size={20} className="animate-spin text-navy-800!" aria-hidden="true" />
                ) : (
                <Search size={20} aria-hidden="true" />
                )}
                <input
                ref={qRef}
                id="q"
                name="q"
                type="search"
                aria-label="Cari judul buku atau nama pengarang"
                className={cx(ctl.input, "h-11")}
                defaultValue={q}
                onChange={handleSearchChange}
                placeholder="Cari judul buku atau nama pengarang..."
                />
            </div>

            <select
                ref={kategoriRef}
                id="kategori"
                name="kategori"
                aria-label="Filter kategori buku"
                className={cx(ctl.select, "h-11 md:col-start-1 md:row-start-2")}
                defaultValue={kategori}
                onChange={() => applyFilters()}
            >
                <option value="">Kategori: Semua kategori</option>
                {categories.map((c) => (
                <option key={c.id} value={c.id}>
                    Kategori: {c.name}
                </option>
                ))}
            </select>

            <select
                ref={urutRef}
                id="urut"
                name="urut"
                aria-label="Urutkan daftar buku"
                className={cx(ctl.select, "h-11 md:col-start-2 md:row-start-2")}
                defaultValue={urut}
                onChange={() => applyFilters()}
            >
                {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                    Urutkan: {s.label}
                </option>
                ))}
            </select>

            <button
                type="button"
                onClick={handleReset}
                className={cx(
                btn("outline"),
                "h-11 w-full justify-center bg-white hover:bg-navy-50 md:col-start-3 md:row-start-2"
                )}
            >
                Hapus
            </button>
            </div>
        </MobileCollapse>
        </form>
    );
}