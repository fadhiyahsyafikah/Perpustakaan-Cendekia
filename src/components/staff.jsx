import Link from "next/link";
import { Check, X, Undo2, Banknote, RefreshCw, Search } from "lucide-react";
import BookCover from "@/components/BookCover";
import ConfirmForm from "@/components/ConfirmForm";
import { ActionButton } from "@/components/form";
import { StatusBadge, EmptyState } from "@/components/ui";
import { approveLoan, rejectLoan, returnLoan, decideExtension, payFine } from "@/actions/loans";
import { rupiah, tanggal, tanggalSingkat, waktu, sisaHariLabel } from "@/lib/format";
import { T, btn, ctl, stock } from "@/lib/styles";
import { idLabel } from "@/lib/config";

export function SearchBar({ action, q, placeholder, extra }) {
  return (
    <form action={action} method="get" role="search" className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none">
      {extra}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="q" className="text-[0.9375rem] font-semibold text-n-900">Cari</label>
        <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]">
          <Search size={20} aria-hidden="true" />
          <input id="q" name="q" type="search" className={ctl.input} defaultValue={q} placeholder={placeholder} />
        </div>
      </div>
      <button type="submit" className={btn("primary")}>Cari</button>
      {q && <Link href={action} className={btn("ghost")}>Hapus pencarian</Link>}
    </form>
  );
}

const Person = ({ r }) => (
  <div><b>{r.full_name}</b><br /><small className="text-n-700">{idLabel(r.role)} {r.identity_number}</small></div>
);

export function PendingTable({ rows }) {
  if (!rows.length) return <EmptyState icon={Check} title="Tidak ada antrean" text="Semua permohonan peminjaman sudah diproses. Kerja bagus!" />;
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
      <table className={T.table}>
        <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Peminjam</th><th className={T.th}>Buku</th><th className={T.th}>Diajukan</th><th className={T.thRight}>Stok</th><th className={T.thRight}>Keputusan</th></tr></thead>
        <tbody className={T.tbody}>
          {rows.map((r) => (
            <tr key={r.id} className={T.tr}>
              <td data-label="Peminjam" className={T.td}><Person r={r} /></td>
              <td  data-label="Buku" className={T.tdMain}>
                <div className="flex min-w-0 items-center gap-3 [&_b]:block [&_b]:text-n-900 [&_small]:text-n-700"><BookCover src={r.cover_url} title={r.title} small /><div><b>{r.title}</b><small>{r.author}</small></div></div>
              </td>
              <td data-label="Diajukan" className={T.td}>{waktu(r.requested_at)}</td>
              <td  data-label="Stok tersedia" className={T.tdNum}>
                {r.available_stock > 0 ? <span className={stock(true)}>{r.available_stock}</span> : <span className={stock(false)}>Habis</span>}
              </td>
              <td  data-label="Keputusan" className={T.tdActions}>
                <ActionButton action={approveLoan} fields={{ loan_id: r.id }} variant="green" size="sm" icon={<Check size={18} aria-hidden="true" />} disabled={r.available_stock <= 0}>Approve</ActionButton>
                <ConfirmForm
                  action={rejectLoan}
                  fields={{ loan_id: r.id }}
                  triggerLabel="Reject"
                  triggerIcon={<X size={18} aria-hidden="true" />}
                  triggerVariant="danger"
                  title="Tolak permohonan?"
                  description={`${r.full_name} mengajukan ${r.title}. Alasan akan ditampilkan kepada mahasiswa.`}
                  confirmLabel="Tolak permohonan"
                  confirmVariant="danger"
                  reason={{ label: "Alasan penolakan", placeholder: "Contoh: Buku sedang diperbaiki.", hint: "Wajib diisi, minimal 5 karakter." }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CirculationTable({ rows }) {
  if (!rows.length) return <EmptyState icon={Search} title="Transaksi aktif tidak ditemukan" text="Coba cari dengan NIM/ID, nama peminjam, atau judul buku lain." />;
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
      <table className={T.table}>
        <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Peminjam</th><th className={T.th}>Buku</th><th className={T.th}>Status</th><th className={T.th}>Jatuh tempo</th><th className={T.thRight}>Perkiraan denda</th><th className={T.thRight}>Tindakan</th></tr></thead>
        <tbody className={T.tbody}>
          {rows.map((r) => (
            <tr key={r.id} className={T.tr}>
              <td data-label="Peminjam" className={T.td}><Person r={r} /></td>
              <td  data-label="Buku" className={T.tdMain}><b>{r.title}</b></td>
              <td data-label="Status" className={T.td}><StatusBadge status={r.status} />{r.late_days > 0 && <> <StatusBadge status="Terlambat" /></>}</td>
              <td data-label="Jatuh tempo" className={T.td}>{tanggalSingkat(r.due_date)}<br /><small className={r.days_left < 0 ? "font-semibold text-red-600" : "text-n-700"}>{sisaHariLabel(r.days_left)}</small></td>
              <td  data-label="Perkiraan denda" className={T.tdNum}>{r.est_fine > 0 ? <b className="font-semibold text-red-600">{rupiah(r.est_fine)}</b> : <span className="text-n-700">Rp 0</span>}</td>
              <td  data-label="Tindakan" className={T.tdActions}>
                <ConfirmForm
                  action={returnLoan}
                  fields={{ loan_id: r.id }}
                  triggerLabel="Konfirmasi Pengembalian"
                  triggerIcon={<Undo2 size={18} aria-hidden="true" />}
                  triggerVariant="primary"
                  title="Konfirmasi pengembalian buku?"
                  description={
                    r.late_days > 0
                      ? `${r.title} dari ${r.full_name} terlambat ${r.late_days} hari. Denda ${rupiah(r.est_fine)} akan dicatat dan mahasiswa diblokir sampai lunas.`
                      : `Pastikan buku fisik ${r.title} dari ${r.full_name} sudah diterima. Pengembalian tepat waktu, tanpa denda.`
                  }
                  confirmLabel="Ya, buku sudah diterima"
                  confirmVariant="green"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExtensionTable({ rows }) {
  if (!rows.length) return <EmptyState icon={RefreshCw} title="Tidak ada pengajuan perpanjangan" text="Pengajuan baru dari mahasiswa akan tampil di sini." />;
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
      <table className={T.table}>
        <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Peminjam</th><th className={T.th}>Buku</th><th className={T.th}>Jatuh tempo</th><th className={T.th}>Diajukan</th><th className={T.thRight}>Keputusan</th></tr></thead>
        <tbody className={T.tbody}>
          {rows.map((r) => (
            <tr key={r.id} className={T.tr}>
              <td data-label="Peminjam" className={T.td}><Person r={r} /></td>
              <td  data-label="Buku" className={T.tdMain}><b>{r.title}</b></td>
              <td data-label="Jatuh tempo" className={T.td}>{tanggalSingkat(r.old_due_date)}<br /><small className="text-n-700">menjadi {tanggalSingkat(r.proposed_due)} (+{r.max_loan_days} hari)</small></td>
              <td data-label="Diajukan" className={T.td}>{waktu(r.requested_at)}</td>
              <td  data-label="Keputusan" className={T.tdActions}>
                <ActionButton action={decideExtension} fields={{ extension_id: r.id, keputusan: "setuju" }} variant="green" size="sm" icon={<Check size={18} aria-hidden="true" />}>Setujui</ActionButton>
                <ConfirmForm
                  action={decideExtension}
                  fields={{ extension_id: r.id, keputusan: "tolak" }}
                  triggerLabel="Tolak"
                  triggerIcon={<X size={18} aria-hidden="true" />}
                  triggerVariant="danger"
                  title="Tolak perpanjangan?"
                  description="Jatuh tempo tetap seperti semula dan alasan ditampilkan kepada mahasiswa."
                  confirmLabel="Tolak perpanjangan"
                  confirmVariant="danger"
                  reason={{ label: "Alasan penolakan", placeholder: "Contoh: Buku sedang banyak diminati." }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FineTable({ rows, paid = false }) {
  if (!rows.length) return <EmptyState icon={Banknote} title={paid ? "Belum ada denda lunas" : "Tidak ada denda tertunggak"} text={paid ? "Denda yang sudah dilunasi akan tampil di sini." : "Semua denda sudah lunas."} />;
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
      <table className={T.table}>
        <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Peminjam</th><th className={T.th}>Buku</th><th className={T.th}>Rincian</th><th className={T.thRight}>Nominal</th><th className={T.th}>Status</th>{!paid && <th className={T.thRight}>Tindakan</th>}</tr></thead>
        <tbody className={T.tbody}>
          {rows.map((f) => (
            <tr key={f.id} className={T.tr}>
              <td data-label="Peminjam" className={T.td}><Person r={f} /></td>
              <td  data-label="Buku" className={T.tdMain}><b>{f.title}</b></td>
              <td data-label="Rincian" className={T.td}>{f.late_days} hari x {rupiah(f.fine_per_day)}</td>
              <td  data-label="Nominal" className={T.tdNum}><b>{rupiah(f.amount)}</b></td>
              <td data-label="Status" className={T.td}><StatusBadge status={f.status} />{paid && f.paid_at && <div className="mt-1 mb-0 text-sm text-n-700">{waktu(f.paid_at)}{f.recorded_by_name ? ` oleh ${f.recorded_by_name}` : ""}</div>}</td>
              {!paid && (
                <td  data-label="Tindakan" className={T.tdActions}>
                  <ConfirmForm
                    action={payFine}
                    fields={{ fine_id: f.id }}
                    triggerLabel="Tandai Lunas"
                    triggerIcon={<Check size={18} aria-hidden="true" />}
                    triggerVariant="green"
                    title="Catat pelunasan denda?"
                    description={`Pastikan uang tunai ${rupiah(f.amount)} dari ${f.full_name} sudah diterima di Meja Layanan.`}
                    confirmLabel="Ya, sudah dibayar"
                    confirmVariant="green"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
