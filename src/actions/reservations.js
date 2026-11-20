"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/session";
import { idSchema } from "@/lib/validators";
import { ok, fail, dbMessage } from "@/lib/result";
import * as svc from "@/lib/services/reservations";
import { BORROWER_ROLES } from "@/lib/config";

export async function createReservation(prev, formData) {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("book_id"));
  if (!id.success) return fail("Buku tidak valid.");
  try {
    const r = await svc.createReservation(auth.user, id.data);
    revalidatePath("/", "layout");
    return ok(`Reservasi ${r.title} tercatat. Anda akan diberi tahu saat buku siap diambil.`);
  } catch (e) {
    return fail(dbMessage(e));
  }
}

export async function cancelReservation(prev, formData) {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("reservation_id"));
  if (!id.success) return fail("Reservasi tidak valid.");
  try {
    await svc.cancelReservation(auth.user, id.data);
    revalidatePath("/", "layout");
    return ok("Reservasi dibatalkan.");
  } catch (e) {
    return fail(dbMessage(e));
  }
}
