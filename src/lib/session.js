import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { query } from "@/lib/db";
import { CONFIG, HOME_BY_ROLE } from "@/lib/config";

function secretKey() {
    const s = process.env.SESSION_SECRET;
    if (!s || s.length < 32) {
        throw new Error("SESSION_SECRET belum diisi atau kurang dari 32 karakter. Periksa berkas .env Anda.");
    }
    return new TextEncoder().encode(s);
}

// Membuat cookie sesi httpOnly berisi token bertanda tangan (id, role)
export async function createSession(user) {
    const token = await new SignJWT({ role: user.role, name: user.full_name })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime(`${CONFIG.SESSION_HOURS}h`)
        .sign(secretKey());
    const store = await cookies();
    store.set(CONFIG.SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE === "true",
        path: "/",
        maxAge: CONFIG.SESSION_HOURS * 3600,
    });
}

export async function destroySession() {
    const store = await cookies();
    store.delete(CONFIG.SESSION_COOKIE);
}

async function readToken() {
    const store = await cookies();
    const token = store.get(CONFIG.SESSION_COOKIE)?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secretKey());
        return { id: Number(payload.sub), role: payload.role };
    } catch {
        return null;
    }
}

// Pengguna saat ini, divalidasi ulang ke database (akun nonaktif / dihapus dianggap keluar)
export const getCurrentUser = cache(async () => {
    const tk = await readToken();
    if (!tk) return null;
    const { rows } = await query(
        "SELECT id, full_name, email, role, identity_number FROM users WHERE id = $1 AND is_active = TRUE",
        [tk.id]
    );
    return rows[0] || null;
});

// Dipakai pada halaman (Server Component): lapis kedua setelah middleware
export async function requireUser(roles) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    if (roles && !roles.includes(user.role)) redirect("/403");
    return user;
}

// Dipakai pada Server Action / Route Handler: mengembalikan hasil, bukan melempar redirect
export async function authorize(roles) {
    const user = await getCurrentUser();
    if (!user) return { ok: false, status: 401, message: "Sesi Anda berakhir. Silakan masuk kembali." };
    if (roles && !roles.includes(user.role)) {
        return { ok: false, status: 403, message: "Anda tidak memiliki hak akses untuk tindakan ini." };
    }
    return { ok: true, user };
}

export function homeFor(role) {
    return HOME_BY_ROLE[role] || "/";
}
