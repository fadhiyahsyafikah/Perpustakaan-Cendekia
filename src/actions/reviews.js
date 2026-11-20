"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/session";
import { idSchema, reviewSchema } from "@/lib/validators";
import { ok, fail, zodErrors, formToObject, dbMessage } from "@/lib/result";
import { createReview as createReviewSvc } from "@/lib/services/loans";
import { BORROWER_ROLES } from "@/lib/config";

// ULS-01
export async function createReview(prev, formData) {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  const raw = formToObject(formData);
  const loanId = idSchema.safeParse(raw.loan_id);
  if (!loanId.success) return fail("Transaksi tidak valid.");
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = zodErrors(parsed.error);
    if (errors.rating) errors.rating = "Pilih rating 1 sampai 5 bintang.";
    return fail("Periksa kembali ulasan Anda.", errors, raw);
  }
  try {
    const r = await createReviewSvc(auth.user, loanId.data, parsed.data.rating, parsed.data.comment);
    revalidatePath("/", "layout");
    return ok("Terima kasih! Ulasan Anda sudah tersimpan.", { redirectTo: `/katalog/${r.book_id}#ulasan` });
  } catch (e) {
    return fail(dbMessage(e), {}, raw);
  }
}
