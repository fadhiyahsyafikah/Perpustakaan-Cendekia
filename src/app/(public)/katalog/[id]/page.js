import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, LogIn, Info, BookCheck, CalendarClock, Hourglass } from "lucide-react";
import BookCover from "@/components/BookCover";
import { ActionForm, SubmitButton } from "@/components/form";
import ConfirmForm from "@/components/ConfirmForm";
import { Stars, EmptyState } from "@/components/ui";
import { getBookDetail, getReviews } from "@/lib/data/books";
import { getCurrentUser } from "@/lib/session";
import { getLoanButtonState } from "@/lib/services/loans";
import { sweepExpiredReservations } from "@/lib/services/reservations";
import { requestLoan } from "@/actions/loans";
import { createReservation, cancelReservation } from "@/actions/reservations";
import { rupiah, tanggalSingkat, inisial } from "@/lib/format";
import { btn, stock } from "@/lib/styles";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = Number.isInteger(+id) ? await getBookDetail(+id) : null;
  return { title: book ? book.title : "Buku tidak ditemukan" };
}

function LoanBox({ state, book }) {
  switch (state.state) {
    case "guest":
      return (
        <>
          <Link href={`/login?next=/katalog/${book.id}`} className={btn("primary", "lg", true)}><LogIn size={20} aria-hidden="true" /> Login untuk meminjam</Link>
          <p className="m-0 text-[0.9375rem] text-n-700 [&_svg]:mr-1.5 [&_svg]:inline [&_svg]:align-[-3px]"><Info size={18} aria-hidden="true" /> Belum punya akun? <Link href="/register">Daftar akun</Link>.</p>
        </>
      );
    case "staff":
      return <p className="m-0 text-[0.9375rem] text-n-700 [&_svg]:mr-1.5 [&_svg]:inline [&_svg]:align-[-3px]"><Info size={18} aria-hidden="true" /> Peminjaman hanya dapat dilakukan oleh akun Mahasiswa atau Pengunjung Umum.</p>;
    case "ok":
      return (
        <ActionForm action={requestLoan} inlineError>
          <input type="hidden" name="book_id" value={book.id} />
          <SubmitButton variant="green" size="lg" block icon={<BookCheck size={18} aria-hidden="true" />}>Ajukan Pinjam</SubmitButton>
          <p className="mt-2.5 mb-0 text-[0.9375rem] text-n-700 [&_svg]:mr-1.5 [&_svg]:inline [&_svg]:align-[-3px]"><Info size={18} aria-hidden="true" /> {state.hasReadyReservation ? "Reservasi Anda siap diambil. " : ""}Setelah mengajukan, datang ke meja sirkulasi untuk konfirmasi.</p>
        </ActionForm>
      );
    case "reserved":
      return (
        <>
          <p className="m-0 text-[0.9375rem] text-n-700 [&_svg]:mr-1.5 [&_svg]:inline [&_svg]:align-[-3px]"><Hourglass size={18} aria-hidden="true" /> {state.status === "Siap Diambil" ? "Reservasi Anda siap diambil. Segera ajukan pinjam." : "Anda sudah berada dalam antrean reservasi buku ini."}</p>
          <ConfirmForm action={cancelReservation} fields={{ reservation_id: state.reservationId }} triggerLabel="Batalkan reservasi" triggerVariant="outline" title="Batalkan reservasi?" description="Anda akan keluar dari antrean buku ini." confirmLabel="Ya, batalkan" confirmVariant="danger" />
        </>
      );
    case "empty":
      return (
        <>
          <button className={btn("primary", "lg", true)} disabled aria-disabled="true"><Lock size={20} aria-hidden="true" /> Ajukan Pinjam</button>
          <p className="m-0 text-[0.9375rem] text-n-700 [&_svg]:mr-1.5 [&_svg]:inline [&_svg]:align-[-3px]"><Info size={18} aria-hidden="true" /> {state.reason}</p>
          <ActionForm action={createReservation}>
            <input type="hidden" name="book_id" value={book.id} />
            <SubmitButton variant="yellow" block icon={<CalendarClock size={18} aria-hidden="true" />}>Reservasi (masuk antrean)</SubmitButton>
          </ActionForm>
        </>
      );
    default: // blocked, has_loan, limit
      return (
        <>
          <button className={btn("primary", "lg", true)} disabled aria-disabled="true"><Lock size={20} aria-hidden="true" /> Ajukan Pinjam</button>
          <p className="m-0 text-[0.9375rem] text-n-700 [&_svg]:mr-1.5 [&_svg]:inline [&_svg]:align-[-3px]"><Info size={18} aria-hidden="true" /> {state.reason}</p>
        </>
      );
  }
}

export default async function BookDetailPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  await sweepExpiredReservations().catch(() => {});
  const book = await getBookDetail(Number(id));
  if (!book) notFound();
  const [reviews, user] = await Promise.all([getReviews(book.id), getCurrentUser()]);
  const state = await getLoanButtonState(user, book);
  const out = book.available_stock <= 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-7 pb-2">
      <nav className="mb-4 flex flex-wrap gap-1.5 text-sm text-n-700 [&_a]:text-n-700 [&_[aria-current]]:font-semibold [&_[aria-current]]:text-navy-800" aria-label="Jejak halaman">
        <Link href="/">Beranda</Link> / <Link href="/katalog">Katalog</Link> / <span aria-current="page">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] lg:gap-10">
        <div className="mx-auto w-full max-w-[190px] shadow-md md:max-w-[320px]"><BookCover src={book.cover_url} title={book.title} className="shadow-md" /></div>
        <div>
          <span className="inline-block max-w-full rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{book.category_name}</span>
          <h1 className="mt-2">{book.title}</h1>
          <p className="mb-2 text-lg text-n-700">oleh {book.author}</p>
          <Stars value={book.avg_rating} count={book.review_count} size={20} />

          <table className="my-4 w-full border-collapse [&_th]:w-[42%] [&_th]:border-b [&_th]:border-n-200 [&_th]:py-2.5 [&_th]:pr-3 [&_th]:text-left [&_th]:align-top [&_th]:text-[0.9375rem] [&_th]:font-medium [&_th]:text-n-700 [&_td]:border-b [&_td]:border-n-200 [&_td]:py-2.5 [&_td]:text-left [&_td]:align-top [&_td]:text-[0.9375rem]">
            <tbody>
              <tr><th scope="row">ISBN</th><td>{book.isbn}</td></tr>
              <tr><th scope="row">Penerbit</th><td>{book.publisher}</td></tr>
              <tr><th scope="row">Tahun terbit</th><td>{book.publish_year}</td></tr>
              <tr><th scope="row">Kategori</th><td>{book.category_name}</td></tr>
              <tr><th scope="row">Sisa stok</th><td><span className={stock(!out)}>{out ? "Habis" : `${book.available_stock} dari ${book.total_stock} eksemplar`}</span></td></tr>
              <tr><th scope="row">Batas lama pinjam</th><td>{book.max_loan_days} hari</td></tr>
              <tr><th scope="row">Denda per hari</th><td>{rupiah(book.fine_per_day)}</td></tr>
            </tbody>
          </table>

          <div className="max-md:sticky max-md:bottom-0 max-md:z-20 max-md:-mx-4 max-md:border-t max-md:border-n-200 max-md:bg-white max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))] max-md:shadow-[0_-4px_12px_rgba(10,17,114,0.08)]">
            <div className="grid gap-2.5 rounded-lg bg-navy-50 p-[18px]"><LoanBox state={state} book={book} /></div>
          </div>
        </div>
      </div>

      <section className="mt-10" id="ulasan" aria-labelledby="h-ulasan">
        <h2 id="h-ulasan">Ulasan pembaca</h2>
        {reviews.length ? (
          <div>
            {reviews.map((r) => (
              <article key={r.id} className="flex gap-3.5 border-b border-n-200 py-4 [&_p]:mt-1.5 [&_p]:mb-0">
                <div className="grid size-11 flex-none place-items-center rounded-full bg-navy-100 font-heading font-bold text-navy-800" aria-hidden="true">{inisial(r.full_name)}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 [&_time]:text-[0.8125rem] [&_time]:text-n-500">
                    <b>{r.full_name}</b>
                    <Stars value={r.rating} size={14} />
                    <time>{tanggalSingkat(r.created_at)}</time>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada ulasan" text="Ulasan akan tampil setelah pembaca selesai meminjam dan menilai buku ini." />
        )}
      </section>
    </div>
  );
}
