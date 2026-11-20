import Link from "next/link";
import { redirect } from "next/navigation";
import { Send } from "lucide-react";
import { requireUser } from "@/lib/session";
import { query } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { ActionForm, SubmitButton, StarInput, TextAreaField } from "@/components/form";
import BookCover from "@/components/BookCover";
import { createReview } from "@/actions/reviews";
import { BORROWER_ROLES, CONFIG } from "@/lib/config";
import { btn } from "@/lib/styles";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Tulis Ulasan" };

export default async function ReviewPage({ params }) {
  const user = await requireUser(BORROWER_ROLES);
  const { loanId } = await params;
  if (!/^\d+$/.test(loanId)) redirect("/mahasiswa/riwayat");
  const { rows } = await query(
    `SELECT l.id, l.status, b.id AS book_id, b.title, b.author, b.cover_url,
            EXISTS (SELECT 1 FROM reviews r WHERE r.loan_id = l.id) AS reviewed
     FROM loans l JOIN books b ON b.id = l.book_id WHERE l.id = $1 AND l.user_id = $2`,
    [Number(loanId), user.id]
  );
  const l = rows[0];
  if (!l) redirect("/mahasiswa/riwayat");
  if (l.status !== "Selesai" || l.reviewed) {
    return (
      <div className="grid gap-5">
        <PageHeader title="Tulis Ulasan" back={{ href: "/mahasiswa/riwayat", label: "Kembali ke riwayat" }} />
        <EmptyState
          title={l.reviewed ? "Anda sudah mengulas buku ini" : "Ulasan belum dapat ditulis"}
          text={l.reviewed ? "Satu transaksi hanya dapat diulas satu kali." : "Ulasan hanya dapat ditulis setelah buku dikembalikan."}
          action={<Link href="/mahasiswa/riwayat" className={btn("primary")}>Kembali ke riwayat</Link>}
        />
      </div>
    );
  }
  return (
    <div className="grid max-w-[720px] gap-5">
      <PageHeader title="Tulis Ulasan" back={{ href: "/mahasiswa/riwayat", label: "Kembali ke riwayat" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3.5 [&>div:first-child]:w-14 [&>div:first-child]:flex-none">
          <BookCover src={l.cover_url} title={l.title} />
          <div><h2 className="mb-0.5">{l.title}</h2><p className="m-0 text-n-700">{l.author}</p></div>
        </div>
        <ActionForm action={createReview} className="grid gap-[18px]" inlineError>
          <input type="hidden" name="loan_id" value={l.id} />
          <StarInput />
          <TextAreaField label="Komentar Anda" name="comment" maxLength={CONFIG.MAX_COMMENT} rows={5} placeholder="Ceritakan pendapat Anda tentang buku ini (opsional)" hint="Ulasan akan tampil di halaman buku dan tidak dapat diubah setelah dikirim." />
          <div className="mt-1.5 flex flex-wrap gap-3 max-[479px]:[&>*]:basis-full"><SubmitButton size="lg" icon={<Send size={18} aria-hidden="true" />} pendingText="Mengirim...">Kirim ulasan</SubmitButton></div>
        </ActionForm>
      </div>
    </div>
  );
}
