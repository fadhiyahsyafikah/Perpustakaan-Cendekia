import { NextResponse } from "next/server";
import { searchBooks } from "@/lib/data/books";

// GET /api/books?q=&kategori=&urut=&halaman=  (publik, parameter di-whitelist)
export async function GET(request) {
    try {
        const sp = request.nextUrl.searchParams;
        const data = await searchBooks({ q: sp.get("q") || "", kategori: sp.get("kategori"), urut: sp.get("urut"), halaman: sp.get("halaman") });
        return NextResponse.json(data);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Gagal mengambil data buku." }, { status: 500 });
    }
}
