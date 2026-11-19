"use server";

import { revalidatePath } from "next/cache";
import { query, withTransaction, BusinessError } from "@/lib/db";
import { authorize } from "@/lib/session";
import { bookCreateSchema, bookUpdateSchema, idSchema } from "@/lib/validators";
import { ok, fail, zodErrors, formToObject, dbMessage } from "@/lib/result";
import { removeCoverFile } from "@/lib/uploads";

const STAFF = ["pegawai", "admin"];

// BUK-02
export async function createBook(prev, formData) {
  const auth = await authorize(STAFF);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const parsed = bookCreateSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), raw);
  const d = parsed.data;
  try {
    await query(
      `INSERT INTO books (isbn, title, author, publisher, publish_year, category_id, total_stock, available_stock, max_loan_days, fine_per_day, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)`,
      [d.isbn, d.title, d.author, d.publisher, d.publish_year, d.category_id, d.total_stock, d.max_loan_days, d.fine_per_day, d.cover_url || null]
    );
  } catch (e) {
    if (e?.code === "23503") return fail("Kategori yang dipilih tidak ditemukan.", { category_id: "Pilih kategori yang tersedia." }, raw);
    const msg = dbMessage(e);
    return fail(msg, e?.code === "23505" ? { isbn: msg } : {}, raw);
  }
  revalidatePath("/", "layout");
  return ok(`Buku ${d.title} berhasil ditambahkan.`, { redirectTo: "/kelola/buku" });
}

// BUK-03 + BUK-06: ISBN tidak diubah; stok total tidak boleh di bawah eksemplar yang sedang dipinjam
export async function updateBook(prev, formData) {
  const auth = await authorize(STAFF);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const id = idSchema.safeParse(raw.id);
  if (!id.success) return fail("Buku tidak valid.");
  const parsed = bookUpdateSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), raw);
  const d = parsed.data;
  let oldCover = null;
  try {
    await withTransaction(async (c) => {
      const b = (await c.query("SELECT id, cover_url FROM books WHERE id = $1 AND deleted_at IS NULL FOR UPDATE", [id.data])).rows[0];
      if (!b) throw new BusinessError("Buku tidak ditemukan.", 404);
      const borrowed = (
        await c.query("SELECT COUNT(*) AS n FROM loans WHERE book_id = $1 AND status IN ('Sedang Dipinjam','Perpanjangan Diajukan')", [id.data])
      ).rows[0].n;
      if (d.total_stock < borrowed) {
        const e = new BusinessError(`Stok total tidak boleh kurang dari ${borrowed}, yaitu jumlah eksemplar yang sedang dipinjam.`);
        e.field = "total_stock";
        throw e;
      }
      await c.query(
        `UPDATE books SET title = $2, author = $3, publisher = $4, publish_year = $5, category_id = $6,
                total_stock = $7, available_stock = $7 - $8::int, max_loan_days = $9, fine_per_day = $10,
                cover_url = $11, updated_at = now() WHERE id = $1`,
        [id.data, d.title, d.author, d.publisher, d.publish_year, d.category_id, d.total_stock, borrowed, d.max_loan_days, d.fine_per_day, d.cover_url || null]
      );
      if (b.cover_url && b.cover_url !== (d.cover_url || null)) oldCover = b.cover_url;
    });
  } catch (e) {
    if (e?.code === "23503") return fail("Kategori yang dipilih tidak ditemukan.", { category_id: "Pilih kategori yang tersedia." }, raw);
    return fail(dbMessage(e), e?.field ? { [e.field]: e.message } : {}, raw);
  }
  if (oldCover) await removeCoverFile(oldCover); // berkas lama boleh dihapus (BUK-06)
  revalidatePath("/", "layout");
  return ok("Data buku berhasil diperbarui.", { redirectTo: "/kelola/buku" });
}

// BUK-04 / BR-10: soft delete, ditolak bila masih ada pinjaman aktif atau permohonan menunggu
export async function deleteBook(prev, formData) {
  const auth = await authorize(STAFF);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Buku tidak valid.");
  try {
    await withTransaction(async (c) => {
      const b = (await c.query("SELECT id FROM books WHERE id = $1 AND deleted_at IS NULL FOR UPDATE", [id.data])).rows[0];
      if (!b) throw new BusinessError("Buku tidak ditemukan.", 404);
      const n = (
        await c.query("SELECT COUNT(*) AS n FROM loans WHERE book_id = $1 AND status IN ('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan')", [id.data])
      ).rows[0].n;
      if (n > 0) throw new BusinessError(`Buku ini tidak dapat dihapus karena masih ada ${n} pinjaman aktif atau permohonan yang menunggu.`);
      await c.query("UPDATE reservations SET status = 'Dibatalkan' WHERE book_id = $1 AND status IN ('Menunggu','Siap Diambil')", [id.data]);
      await c.query("UPDATE books SET deleted_at = now(), updated_at = now() WHERE id = $1", [id.data]);
    });
  } catch (e) {
    return fail(dbMessage(e));
  }
  revalidatePath("/", "layout");
  return ok("Buku berhasil dihapus dari koleksi. Riwayat transaksi dan ulasan tetap tersimpan.");
}
