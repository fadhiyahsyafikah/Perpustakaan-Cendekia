import Link from "next/link";
import { BookOpen, Wallet, Search, Lock, CircleAlert, ClockAlert, RefreshCw } from "lucide-react";
import { requireUser } from "@/lib/session";
import { studentActiveLoans, studentFines, studentHistory, studentReservations } from "@/lib/data/loans";
import { getBorrowerStatus, generateReminders } from "@/lib/services/loans";
import { sweepExpiredReservations } from "@/lib/services/reservations";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "@/components/ui";
import BookCover from "@/components/BookCover";
import ConfirmForm from "@/components/ConfirmForm";
import { requestExtension } from "@/actions/loans";
import { cancelReservation } from "@/actions/reservations";
import { BORROWER_ROLES, CONFIG } from "@/lib/config";
import HistoryTable from "@/components/HistoryTable";
import { rupiah, tanggal, sisaHariLabel, waktu } from "@/lib/format";
import { T, btn } from "@/lib/styles";

export const metadata = { title: "Dashboard Mahasiswa" };

export default async function MahasiswaDashboard() {
  const user = await requireUser(BORROWER_ROLES);
  await Promise.all([generateReminders(user.id), sweepExpiredReservations()]).catch(() => {});
  const [loans, fines, hist, st, reservations] = await Promise.all([
    studentActiveLoans(user.id),
    studentFines(user.id),
    studentHistory(user.id, { pageSize: 5 }),
    getBorrowerStatus(user.id),
    studentReservations(user.id),
  ]);
  const overdue = loans.filter((l) => l.status !== "Menunggu Konfirmasi" && l.days_left < 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Dashboard"
        subtitle="Pantau pinjaman, jatuh tempo, dan denda Anda di sini."
        actions={<Link href="/katalog" className={btn("primary")}><Search size={18} aria-hidden="true" /> Cari buku</Link>}
      />

      {/* Kartu peringatan Status Denda Tertunggak (DEN-05) */}
      {(fines.length > 0 || overdue.length > 0) && (
        <section className="mb-4 flex items-start gap-3 rounded-md border-l-4 px-4 py-3.5 [&>svg]:mt-0.5 [&>svg]:shrink-0 border-red-600 bg-red-100 text-red-600 [&>div]:text-n-900 [&_strong]:text-red-600 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-[18px]" role="alert" aria-labelledby="h-denda">
          <CircleAlert size={26} aria-hidden="true" />
          <div className="flex-1 [&_strong]:mb-0.5 [&_strong]:block">
            <strong id="h-denda" className="text-lg">Status Denda Tertunggak</strong>
            {fines.length > 0 && (
              <>
                <span className="block font-heading text-2xl font-bold text-red-600">{rupiah(st.fine_total)}</span>
                <ul>
                  {fines.map((f) => (
                    <li key={f.id}>{f.title}: terlambat {f.late_days} hari x {rupiah(f.fine_per_day)} = <b>{rupiah(f.amount)}</b></li>
                  ))}
                </ul>
              </>
            )}
            {overdue.length > 0 && (
              <p className="mt-2 mb-0">
                {overdue.length} buku sudah lewat jatuh tempo ({overdue.map((o) => o.title).join(", ")}). Denda berjalan sekitar <b>{rupiah(overdue.reduce((s, o) => s + o.running_fine, 0))}</b> dan terus bertambah tiap hari.
              </p>
            )}
            <p className="mt-2.5 mb-0">
              <Lock size={16} aria-hidden="true" className="align-[-3px]" /> <b>Status blokir:</b>{" "}
              {st.blocked ? "Anda belum dapat mengajukan pinjaman baru. Kembalikan buku dan lunasi denda di meja sirkulasi." : "Tidak terblokir."}
            </p>
          </div>
        </section>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 md:grid-cols-3">
        <StatCard icon={BookOpen} label={`Pinjaman aktif (maksimal ${CONFIG.MAX_ACTIVE_LOANS})`} value={`${st.active_count} buku`} tone="navy" />
        <StatCard icon={ClockAlert} label="Buku lewat jatuh tempo" value={overdue.length} tone={overdue.length ? "red" : "green"} />
        <StatCard icon={Wallet} label="Denda belum lunas" value={rupiah(st.fine_total)} tone={st.fine_total > 0 ? "red" : "green"} />
      </div>

      <section aria-labelledby="h-aktif">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 [&_h2]:m-0"><h2 id="h-aktif">Pinjaman aktif</h2></div>
        {loans.length ? (
          <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
            <table className={T.table}>
              <thead className={T.thead}>
                <tr className={T.tr}><th className={T.th}>Buku</th><th className={T.th}>Status</th><th className={T.th}>Jatuh tempo</th><th className={T.thRight}>Tindakan</th></tr>
              </thead>
              <tbody className={T.tbody}>
                {loans.map((l) => {
                  const canExtend = l.status === "Sedang Dipinjam" && l.days_left >= 0 && l.extension_count < CONFIG.MAX_EXTENSIONS && !st.blocked;
                  return (
                    <tr key={l.id} className={T.tr}>
                      <td  data-label="Buku" className={T.tdMain}>
                        <div className="flex min-w-0 items-center gap-3 [&_b]:block [&_b]:text-n-900 [&_small]:text-n-700">
                          <BookCover src={l.cover_url} title={l.title} small />
                          <div><b><Link href={`/katalog/${l.book_id}`}>{l.title}</Link></b><small>{l.author}</small></div>
                        </div>
                      </td>
                      <td data-label="Status" className={T.td}>
                        <StatusBadge status={l.status} />
                        {l.days_left < 0 && l.status !== "Menunggu Konfirmasi" && <> <StatusBadge status="Terlambat" /></>}
                      </td>
                      <td data-label="Jatuh tempo" className={T.td}>
                        {l.due_date ? (
                          <>
                            {tanggal(l.due_date)}
                            <br />
                            <small className={l.days_left < 0 ? "font-semibold text-red-600" : "text-n-700"}>
                              {sisaHariLabel(l.days_left)}{l.days_left < 0 && l.running_fine > 0 ? `, denda berjalan ${rupiah(l.running_fine)}` : ""}
                            </small>
                          </>
                        ) : (
                          <span className="text-n-700">Menunggu persetujuan</span>
                        )}
                      </td>
                      <td  data-label="Tindakan" className={T.tdActions}>
                        {canExtend ? (
                          <ConfirmForm
                            action={requestExtension}
                            fields={{ loan_id: l.id }}
                            triggerLabel="Ajukan Perpanjangan"
                            triggerIcon={<RefreshCw size={18} aria-hidden="true" />}
                            title="Ajukan perpanjangan?"
                            description={`Masa pinjam ${l.title} akan diperpanjang bila pegawai menyetujui. Perpanjangan hanya bisa dilakukan ${CONFIG.MAX_EXTENSIONS} kali.`}
                            confirmLabel="Ya, ajukan"
                          />
                        ) : (
                          <span className="mt-1 mb-0 text-sm text-n-700">
                            {l.status === "Menunggu Konfirmasi" && "Datang ke meja sirkulasi untuk konfirmasi."}
                            {l.status === "Perpanjangan Diajukan" && "Menunggu keputusan pegawai."}
                            {l.status === "Sedang Dipinjam" && l.days_left < 0 && "Segera kembalikan ke meja sirkulasi."}
                            {l.status === "Sedang Dipinjam" && l.days_left >= 0 && l.extension_count >= CONFIG.MAX_EXTENSIONS && "Sudah diperpanjang 1 kali."}
                            {l.status === "Sedang Dipinjam" && l.days_left >= 0 && l.extension_count < CONFIG.MAX_EXTENSIONS && st.blocked && "Perpanjangan dikunci selama terblokir."}
                            {l.ext_status === "Ditolak" && l.ext_note && l.status === "Sedang Dipinjam" && <><br />Perpanjangan ditolak: {l.ext_note}</>}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={BookOpen} title="Belum ada pinjaman aktif" text="Cari buku yang menarik, lalu ajukan peminjaman dari halaman detail buku." action={<Link href="/katalog" className={btn("primary")}>Jelajahi katalog</Link>} />
        )}
      </section>

      {reservations.length > 0 && (
        <section aria-labelledby="h-reservasi">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 [&_h2]:m-0"><h2 id="h-reservasi">Reservasi buku</h2></div>
          <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
            <table className={T.table}>
              <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Buku</th><th className={T.th}>Status</th><th className={T.th}>Keterangan</th><th className={T.thRight}>Tindakan</th></tr></thead>
              <tbody className={T.tbody}>
                {reservations.map((r) => (
                  <tr key={r.id} className={T.tr}>
                    <td  data-label="Buku" className={T.tdMain}><b><Link href={`/katalog/${r.book_id}`}>{r.title}</Link></b></td>
                    <td data-label="Status" className={T.td}><StatusBadge status={r.status} /></td>
                    <td data-label="Keterangan" className={T.td}>{r.status === "Siap Diambil" ? `Ajukan pinjam sebelum ${waktu(r.expires_at)}` : `Urutan antrean ke-${r.queue_no}`}</td>
                    <td  data-label="Tindakan" className={T.tdActions}>
                      {r.status === "Siap Diambil" && <Link href={`/katalog/${r.book_id}`} className={btn("green", "sm")}>Ajukan pinjam</Link>}
                      <ConfirmForm action={cancelReservation} fields={{ reservation_id: r.id }} triggerLabel="Batalkan" title="Batalkan reservasi?" description={`Anda akan keluar dari antrean buku ${r.title}.`} confirmLabel="Ya, batalkan" confirmVariant="danger" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section aria-labelledby="h-riwayat">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 [&_h2]:m-0">
          <h2 id="h-riwayat">Riwayat terbaru</h2>
          {hist.total > 5 && <Link href="/pengunjung/riwayat" className="font-semibold underline underline-offset-[3px]">Lihat semua riwayat</Link>}
        </div>
        <HistoryTable items={hist.items} />
      </section>
    </div>
  );
}
