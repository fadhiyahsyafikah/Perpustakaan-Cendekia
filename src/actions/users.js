"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { authorize } from "@/lib/session";
import { userCreateSchema, userUpdateSchema, idSchema } from "@/lib/validators";
import { ok, fail, zodErrors, formToObject, dbMessage } from "@/lib/result";

const keep = (raw) => {
  const { password, new_password, ...rest } = raw;
  return rest;
};

// USR-02
export async function createUser(prev, formData) {
  const auth = await authorize(["admin"]);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const parsed = userCreateSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), keep(raw));
  const d = parsed.data;
  try {
    const hash = await bcrypt.hash(d.password, 10);
    await query(
      "INSERT INTO users (full_name, email, password_hash, role, identity_number, is_active) VALUES ($1, $2, $3, $4, $5, TRUE)",
      [d.full_name, d.email, hash, d.role, d.identity_number]
    );
  } catch (e) {
    return fail(dbMessage(e), {}, keep(raw));
  }
  revalidatePath("/", "layout");
  return ok(`Akun ${d.full_name} berhasil dibuat.`, { redirectTo: "/admin/users" });
}

// USR-03 (BR-12: Admin tidak boleh menurunkan role atau menonaktifkan akunnya sendiri)
export async function updateUser(prev, formData) {
  const auth = await authorize(["admin"]);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const id = idSchema.safeParse(raw.id);
  if (!id.success) return fail("Akun tidak valid.");
  const parsed = userUpdateSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), keep(raw));
  const d = parsed.data;
  if (id.data === auth.user.id && (d.role !== "admin" || d.is_active === "false")) {
    return fail("Anda tidak dapat menurunkan peran atau menonaktifkan akun Anda sendiri.", { role: "Akun Anda sendiri harus tetap Admin dan aktif." }, keep(raw));
  }
  try {
    const hash = d.new_password ? await bcrypt.hash(d.new_password, 10) : null;
    const r = await query(
      `UPDATE users SET full_name = $2, email = $3, role = $4, is_active = $5,
              password_hash = COALESCE($6, password_hash), updated_at = now() WHERE id = $1`,
      [id.data, d.full_name, d.email, d.role, d.is_active === "true", hash]
    );
    if (r.rowCount === 0) return fail("Akun tidak ditemukan.");
  } catch (e) {
    return fail(dbMessage(e), {}, keep(raw));
  }
  revalidatePath("/", "layout");
  return ok("Data akun berhasil diperbarui.", { redirectTo: "/admin/users" });
}

// USR-04 (BR-12): tidak boleh menghapus diri sendiri; akun yang pernah bertransaksi hanya dapat dinonaktifkan
export async function deleteUser(prev, formData) {
  const auth = await authorize(["admin"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Akun tidak valid.");
  if (id.data === auth.user.id) return fail("Anda tidak dapat menghapus akun Anda sendiri.");
  try {
    const used = await query("SELECT COUNT(*) AS n FROM loans WHERE user_id = $1", [id.data]);
    if (used.rows[0].n > 0) {
      return fail("Akun ini pernah bertransaksi sehingga tidak dapat dihapus demi menjaga riwayat. Nonaktifkan saja akunnya melalui menu Ubah.");
    }
    const r = await query("DELETE FROM users WHERE id = $1", [id.data]);
    if (r.rowCount === 0) return fail("Akun tidak ditemukan.");
  } catch (e) {
    if (e?.code === "23503") return fail("Akun ini masih terkait data lain (misalnya pengumuman atau transaksi yang diproses). Nonaktifkan saja akunnya.");
    return fail(dbMessage(e));
  }
  revalidatePath("/", "layout");
  return ok("Akun berhasil dihapus.");
}
