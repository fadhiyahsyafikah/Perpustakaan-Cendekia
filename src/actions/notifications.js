"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { authorize } from "@/lib/session";
import { idSchema } from "@/lib/validators";
import { ok, fail, dbMessage } from "@/lib/result";
import { BORROWER_ROLES } from "@/lib/config";

// Hanya notifikasi milik sendiri
export async function markNotificationRead(prev, formData) {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("notification_id"));
  if (!id.success) return fail("Notifikasi tidak valid.");
  try {
    await query("UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2", [id.data, auth.user.id]);
    revalidatePath("/", "layout");
    return { ok: true, message: "", errors: {}, silent: true };
  } catch (e) {
    return fail(dbMessage(e));
  }
}

export async function markAllNotificationsRead() {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  try {
    await query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE", [auth.user.id]);
    revalidatePath("/", "layout");
    return ok("Semua notifikasi ditandai sudah dibaca.");
  } catch (e) {
    return fail(dbMessage(e));
  }
}
