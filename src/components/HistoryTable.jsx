import Link from "next/link";
import BookCover from "@/components/BookCover";
import { StatusBadge, EmptyState, Stars } from "@/components/ui";
import { rupiah, tanggalSingkat } from "@/lib/format";
import { T, btn } from "@/lib/styles";

export default function HistoryTable({ items }) {
  if (!items.length) return <EmptyState title="Belum ada riwayat" text="Riwayat peminjaman yang sudah selesai atau ditolak akan tampil di sini." />;
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
      <table className={T.table}>
        <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Buku</th><th className={T.th}>Status</th><th className={T.th}>Tanggal</th><th className={T.th}>Denda</th><th className={T.thRight}>Ulasan</th></tr></thead>
        <tbody className={T.tbody}>
          {items.map((h) => (
            <tr key={h.id} className={T.tr}>
              <td  data-label="Buku" className={T.tdMain}>
                <div className="flex min-w-0 items-center gap-3 [&_b]:block [&_b]:text-n-900 [&_small]:text-n-700">
                  <BookCover src={h.cover_url} title={h.title} small />
                  <div><b><Link href={`/katalog/${h.book_id}`}>{h.title}</Link></b><small>{h.author}</small></div>
                </div>
              </td>
              <td data-label="Status" className={T.td}>
                <StatusBadge status={h.status} />
                {h.status === "Ditolak" && h.reject_reason && <div className="mt-1 mb-0 text-sm text-n-700">Alasan: {h.reject_reason}</div>}
              </td>
              <td data-label="Tanggal" className={T.td}>
                {h.status === "Selesai" ? <>Pinjam {tanggalSingkat(h.loan_date)}<br /><small className="text-n-700">Kembali {tanggalSingkat(h.returned_at)}</small></> : <>Diajukan {tanggalSingkat(h.requested_at)}</>}
              </td>
              <td data-label="Denda" className={T.td}>
                {h.fine_amount ? <><b>{rupiah(h.fine_amount)}</b> <StatusBadge status={h.fine_status} /></> : <span className="text-n-700">-</span>}
              </td>
              <td  data-label="Ulasan" className={T.tdActions}>
                {h.status !== "Selesai" ? <span className="text-n-700">-</span> : h.review_id ? <Stars value={h.rating} size={16} /> : <Link href={`/pengunjung/ulasan/${h.id}`} className={btn("yellow", "sm")}>Beri ulasan</Link>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
