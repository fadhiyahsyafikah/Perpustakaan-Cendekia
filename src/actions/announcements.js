"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { authorize } from "@/lib/session";
import { announcementSchema, idSchema } from "@/lib/validators";
import { ok, fail, zodErrors, formToObject, dbMessage } from "@/lib/result";

const STAFF = ["pegawai", "admin"];

export async function createAnnouncement(prev, formData) {
  const auth = await authorize(STAFF);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), raw);
  const d = parsed.data;
  try {
    await query(
      "INSERT INTO announcements (title, content, category, release_date, status, author_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [d.title, d.content, d.category, d.release_date, d.status, auth.user.id]
    );
  } catch (e) {
    return fail(dbMessage(e), {}, raw);
  }
  revalidatePath("/", "layout");
  return ok(d.status === "Published" ? "Pengumuman berhasil disimpan dan dipublikasikan." : "Pengumuman disimpan sebagai Draft.", { redirectTo: "/kelola/pengumuman" });
}

export async function updateAnnouncement(prev, formData) {
  const auth = await authorize(STAFF);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const id = idSchema.safeParse(raw.id);
  if (!id.success) return fail("Pengumuman tidak valid.");
  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error), raw);
  const d = parsed.data;
  try {
    const r = await query(
      "UPDATE announcements SET title = $2, content = $3, category = $4, release_date = $5, status = $6, updated_at = now() WHERE id = $1",
      [id.data, d.title, d.content, d.category, d.release_date, d.status]
    );
    if (r.rowCount === 0) return fail("Pengumuman tidak ditemukan.");
  } catch (e) {
    return fail(dbMessage(e), {}, raw);
  }
  revalidatePath("/", "layout");
  return ok("Pengumuman berhasil diperbarui.", { redirectTo: "/kelola/pengumuman" });
}

export async function deleteAnnouncement(prev, formData) {
  const auth = await authorize(STAFF);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Pengumuman tidak valid.");
  try {
    const r = await query("DELETE FROM announcements WHERE id = $1", [id.data]);
    if (r.rowCount === 0) return fail("Pengumuman tidak ditemukan.");
  } catch (e) {
    return fail(dbMessage(e));
  }
  revalidatePath("/", "layout");
  return ok("Pengumuman berhasil dihapus.");
}
