import { readFile } from "node:fs/promises";
import path from "node:path";
import { COVER_DIR } from "@/lib/uploads";

const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Menyajikan sampul dari folder uploads/covers (tetap tersedia pada mode produksi tanpa build ulang)
export async function GET(_req, { params }) {
    const { file } = await params;
    const name = path.basename(file);
    const ext = name.split(".").pop().toLowerCase();
    if (!/^[a-zA-Z0-9._-]+$/.test(name) || !TYPES[ext]) return new Response("Tidak ditemukan", { status: 404 });
    try {
        const data = await readFile(path.join(COVER_DIR, name));
        return new Response(data, { headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } });
    } catch {
        return new Response("Tidak ditemukan", { status: 404 });
    }
}
