"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { createSession, destroySession, homeFor } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validators";
import { fail, zodErrors, formToObject, dbMessage } from "@/lib/result";

// Hash tiruan agar waktu respons sama baik akun ada maupun tidak ada
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.Q6Q6o9k5Yl1tQk6u0h2h4M3Y3oqa";

function safeNext(next) {
    return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : null;
}

// AUTH-02 + Diagram 8: pesan generik, sesi cookie httpOnly
export async function login(prev, formData) {
    const raw = formToObject(formData);
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) return fail("Email dan password wajib diisi.", zodErrors(parsed.error), { email: raw.email || "" });

    let user;
    try {
        const { rows } = await query(
        "SELECT id, full_name, email, role, password_hash, is_active FROM users WHERE lower(email) = $1",
        [parsed.data.email]
        );
        user = rows[0];
        const match = await bcrypt.compare(parsed.data.password, user ? user.password_hash : DUMMY_HASH);
        if (!user || !match || !user.is_active) {
        return fail("Email atau password salah.", {}, { email: parsed.data.email });
        }
        await createSession(user);
    } catch (e) {
        return fail(dbMessage(e), {}, { email: parsed.data.email });
    }
    redirect(safeNext(raw.next) || homeFor(user.role));
    }

    // AUTH-01 + Diagram 7: pendaftaran mandiri Mahasiswa (email kampus) atau Pengunjung Umum (email bebas)
export async function registerAccount(prev, formData) {
    const raw = formToObject(formData);
    const values = { account_type: raw.account_type, full_name: raw.full_name, identity_number: raw.identity_number, email: raw.email };
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), values);
    const d = parsed.data;
    try {
        const dup = await query("SELECT email, identity_number FROM users WHERE lower(email) = $1 OR identity_number = $2", [d.email, d.identity_number]);
        if (dup.rowCount > 0) {
        const errors = {};
        if (dup.rows.some((r) => r.email.toLowerCase() === d.email)) errors.email = "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.";
        if (dup.rows.some((r) => r.identity_number === d.identity_number)) errors.identity_number = "Nomor identitas ini sudah terdaftar.";
        return fail("Pendaftaran belum berhasil.", errors, values);
        }
        const hash = await bcrypt.hash(d.password, 10);
        await query(
        "INSERT INTO users (full_name, email, password_hash, role, identity_number, is_active) VALUES ($1, $2, $3, $4, $5, TRUE)",
        [d.full_name, d.email, hash, d.account_type, d.identity_number]
        );
    } catch (e) {
        return fail(dbMessage(e), {}, values);
    }
    redirect("/login?registered=1");
    }

export async function logout() {
    await destroySession();
    redirect("/");
}
