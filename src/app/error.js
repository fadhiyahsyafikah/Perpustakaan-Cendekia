"use client";

import Link from "next/link";
import { btn } from "@/lib/styles";

export default function GlobalError({ reset }) {
    return (
        <main className="grid min-h-[70vh] place-items-center px-4 py-10 text-center [&_p]:mx-auto [&_p]:mt-2 [&_p]:mb-5 [&_p]:max-w-[44ch] [&_p]:text-n-700">
        <div>
            <div className="font-heading text-[5rem] leading-none font-bold text-navy-800">500</div>
            <h1>Terjadi kesalahan</h1>
            <p>Maaf, ada gangguan pada sistem. Silakan coba lagi beberapa saat. Jika masih berulang, hubungi petugas perpustakaan.</p>
            <button type="button" className={btn("primary", "lg")} onClick={() => reset()}>Coba lagi</button>{" "}
            <Link href="/" className={btn("outline", "lg")}>Kembali ke Beranda</Link>
        </div>
        </main>
    );
}