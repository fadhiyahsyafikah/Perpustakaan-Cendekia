import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { authorize } from "@/lib/session";
import { CONFIG } from "@/lib/config";
import { COVER_DIR, COVER_PREFIX } from "@/lib/uploads";

// Tipe berkas dicek dari isi (magic bytes), bukan hanya dari nama atau MIME yang dikirim klien
function sniff(buf) {
    if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
    if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
    if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
    return null;
}

// POST /api/upload/cover  (Pegawai, Admin) - nama berkas dibuat ulang oleh sistem
export async function POST(request) {
    const auth = await authorize(["pegawai", "admin"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });
    try {
        const type = (request.headers.get("content-type") || "").split(";")[0].trim();
        if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
        return NextResponse.json({ message: "Format gambar harus JPG, PNG, atau WebP." }, { status: 400 });
        }
        const buf = Buffer.from(await request.arrayBuffer());
        if (buf.length === 0) return NextResponse.json({ message: "Pilih berkas gambar terlebih dahulu." }, { status: 400 });
        if (buf.length > CONFIG.MAX_COVER_BYTES) return NextResponse.json({ message: "Ukuran gambar maksimal 2 MB." }, { status: 400 });
        const ext = sniff(buf);
        if (!ext) return NextResponse.json({ message: "Format gambar harus JPG, PNG, atau WebP." }, { status: 400 });
        await mkdir(COVER_DIR, { recursive: true });
        const name = `${randomUUID()}.${ext}`;
        await writeFile(path.join(COVER_DIR, name), buf);
        return NextResponse.json({ url: COVER_PREFIX + name }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Gagal mengunggah gambar." }, { status: 500 });
    }
}