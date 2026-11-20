"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { authorize } from "@/lib/session";
import { categorySchema, idSchema } from "@/lib/validators";
import { ok, fail, zodErrors, formToObject, dbMessage } from "@/lib/result";

// KAT-02
export async function createCategory(prev, formData) {
  const auth = await authorize(["admin"]);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), raw);
  const d = parsed.data;
  try {
    await query("INSERT INTO categories (name, code, description) VALUES ($1, $2, $3)", [d.name, d.code, d.description || null]);
  } catch (e) {
    const msg = dbMessage(e);
    const errors = e?.code === "23505" ? (e.constraint?.includes("code") ? { code: msg } : { name: msg }) : {};
    return fail(msg, errors, raw);
  }
  revalidatePath("/", "layout");
  return ok(`Kategori ${d.name} berhasil ditambahkan.`, { redirectTo: "/admin/kategori" });
}

// KAT-03: keunikan mengabaikan baris yang sedang diedit (ditangani constraint UNIQUE pada baris lain)
export async function updateCategory(prev, formData) {
  const auth = await authorize(["admin"]);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const id = idSchema.safeParse(raw.id);
  if (!id.success) return fail("Kategori tidak valid.");
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), raw);
  const d = parsed.data;
  try {
    const r = await query("UPDATE categories SET name = $2, code = $3, description = $4 WHERE id = $1", [id.data, d.name, d.code, d.description || null]);
    if (r.rowCount === 0) return fail("Kategori tidak ditemukan.");
  } catch (e) {
    const msg = dbMessage(e);
    const errors = e?.code === "23505" ? (e.constraint?.includes("code") ? { code: msg } : { name: msg }) : {};
    return fail(msg, errors, raw);
  }
  revalidatePath("/", "layout");
  return ok("Kategori berhasil diperbarui.", { redirectTo: "/admin/kategori" });
}

// KAT-04 / BR-11: ditolak bila masih ada buku yang terhubung
export async function deleteCategory(prev, formData) {
  const auth = await authorize(["admin"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Kategori tidak valid.");
  try {
    const n = (await query("SELECT COUNT(*) AS n FROM books WHERE category_id = $1", [id.data])).rows[0].n;
    if (n > 0) return fail(`Kategori ini masih dipakai oleh ${n} buku (termasuk buku yang sudah dihapus dari koleksi), sehingga tidak dapat dihapus.`);
    const r = await query("DELETE FROM categories WHERE id = $1", [id.data]);
    if (r.rowCount === 0) return fail("Kategori tidak ditemukan.");
  } catch (e) {
    return fail(dbMessage(e));
  }
  revalidatePath("/", "layout");
  return ok("Kategori berhasil dihapus.");
}
