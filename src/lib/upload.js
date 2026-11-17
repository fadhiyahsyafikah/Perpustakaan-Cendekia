import path from "node:path";
import { unlink } from "node:fs/promises";

// Folder penyimpanan sampul buku (di luar public/, disajikan lewat GET /api/covers/[file])
export const COVER_DIR = path.join(process.cwd(), "uploads", "covers");
export const COVER_PREFIX = "/api/covers/";

// Menghapus berkas sampul lama
export async function removeCoverFile(url) {
    if (!url || !url.startsWith(COVER_PREFIX)) return;
    const name = path.basename(url);
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return;
    try {
        await unlink(path.join(COVER_DIR, name));
    } catch {}
}
