"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/session";
import { idSchema, reasonSchema } from "@/lib/validators";
import { ok, fail, zodErrors, dbMessage } from "@/lib/result";
import { rupiah, tanggal } from "@/lib/format";
import * as svc from "@/lib/services/loans";
import { BORROWER_ROLES } from "@/lib/config";

const done = () => revalidatePath("/", "layout");

// PIN-01 (Mahasiswa)
export async function requestLoan(prev, formData) {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("book_id"));
  if (!id.success) return fail("Buku tidak valid.");
  try {
    const r = await svc.requestLoan(auth.user, id.data);
    done();
    return ok(`Pengajuan terkirim untuk buku ${r.title}. Silakan datang ke Meja Layanan untuk konfirmasi.`, { redirectTo: "/pengunjung/dashboard" });
  } catch (e) {
    return fail(dbMessage(e));
  }
}

// PIN-03 (Pegawai)
export async function approveLoan(prev, formData) {
  const auth = await authorize(["pegawai"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("loan_id"));
  if (!id.success) return fail("Transaksi tidak valid.");
  try {
    const r = await svc.approveLoan(auth.user, id.data);
    done();
    return ok(`Peminjaman buku ${r.title} disetujui. Jatuh tempo ${tanggal(r.due_date)}.`);
  } catch (e) {
    return fail(dbMessage(e));
  }
}

// PIN-04: alasan wajib
export async function rejectLoan(prev, formData) {
  const auth = await authorize(["pegawai"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("loan_id"));
  if (!id.success) return fail("Transaksi tidak valid.");
  const reason = reasonSchema.safeParse({ reason: formData.get("reason") ?? "" });
  if (!reason.success) return fail(zodErrors(reason.error).reason, zodErrors(reason.error));
  try {
    const r = await svc.rejectLoan(auth.user, id.data, reason.data.reason);
    done();
    return ok(`Permohonan buku ${r.title} ditolak. Alasan akan tampil di dashboard mahasiswa.`);
  } catch (e) {
    return fail(dbMessage(e));
  }
}

// PIN-05
export async function returnLoan(prev, formData) {
  const auth = await authorize(["pegawai"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("loan_id"));
  if (!id.success) return fail("Transaksi tidak valid.");
  try {
    const r = await svc.returnLoan(auth.user, id.data);
    done();
    return ok(
      r.amount > 0
        ? `Pengembalian ${r.title} dicatat. Terlambat ${r.late_days} hari, denda ${rupiah(r.amount)} berstatus Tertunggak. Mahasiswa diblokir sampai lunas.`
        : `Pengembalian ${r.title} dicatat tanpa denda.`
    );
  } catch (e) {
    return fail(dbMessage(e));
  }
}

// PRP-01 (Mahasiswa)
export async function requestExtension(prev, formData) {
  const auth = await authorize(BORROWER_ROLES);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("loan_id"));
  if (!id.success) return fail("Transaksi tidak valid.");
  try {
    const r = await svc.requestExtension(auth.user, id.data);
    done();
    return ok(`Perpanjangan buku ${r.title} diajukan. Menunggu persetujuan pegawai.`);
  } catch (e) {
    return fail(dbMessage(e));
  }
}

// PRP-02 (Pegawai). Field "keputusan" bernilai setuju / tolak
export async function decideExtension(prev, formData) {
  const auth = await authorize(["pegawai"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("extension_id"));
  if (!id.success) return fail("Pengajuan tidak valid.");
  const approve = formData.get("keputusan") === "setuju";
  let note = null;
  if (!approve) {
    const reason = reasonSchema.safeParse({ reason: formData.get("reason") ?? "" });
    if (!reason.success) return fail(zodErrors(reason.error).reason, zodErrors(reason.error));
    note = reason.data.reason;
  }
  try {
    const r = await svc.decideExtension(auth.user, id.data, approve, note);
    done();
    return ok(r.approved ? `Perpanjangan ${r.title} disetujui. Jatuh tempo baru ${tanggal(r.due_date)}.` : `Perpanjangan ${r.title} ditolak.`);
  } catch (e) {
    return fail(dbMessage(e));
  }
}

// DEN-03
export async function payFine(prev, formData) {
  const auth = await authorize(["pegawai"]);
  if (!auth.ok) return fail(auth.message);
  const id = idSchema.safeParse(formData.get("fine_id"));
  if (!id.success) return fail("Denda tidak valid.");
  try {
    const r = await svc.payFine(auth.user, id.data);
    done();
    return ok(
      r.stillBlocked
        ? `Denda ${rupiah(r.amount)} dicatat lunas. Mahasiswa masih terblokir karena ada denda atau pinjaman terlambat lainnya.`
        : `Denda ${rupiah(r.amount)} dicatat lunas. Blokir peminjaman mahasiswa sudah dibuka.`
    );
  } catch (e) {
    return fail(dbMessage(e));
  }
}
