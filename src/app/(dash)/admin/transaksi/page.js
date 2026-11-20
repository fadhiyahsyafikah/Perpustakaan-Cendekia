import Link from "next/link";
import { Search, ListChecks, Download } from "lucide-react";
import { requireUser } from "@/lib/session";
import { searchLoans } from "@/lib/data/loans";
import { PageHeader, EmptyState, Pagination, StatusBadge } from "@/components/ui";
import { LOAN_STATUS, idLabel } from "@/lib/config";
import { str, tanggalSingkat, rupiah } from "@/lib/format";
import { T, btn, ctl } from "@/lib/styles";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Monitoring Transaksi" };

export default async function TransaksiPage({ searchParams }) {
  await requireUser(["admin"]);
  const sp = await searchParams;
  const status = Object.values(LOAN_STATUS).includes(str(sp.status)) ? str(sp.status) : "";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(str(sp.from)) ? str(sp.from) : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(str(sp.to)) ? str(sp.to) : "";
  const q = str(sp.q).trim();
  const data = await searchLoans({ status, from, to, q, halaman: str(sp.halaman) });
  return (
    <div className="grid gap-5">
      <PageHeader title="Monitoring Transaksi" subtitle={`${data.total} transaksi ditemukan. Menampilkan seluruh log peminjaman dan status denda.`} actions={<Link href="/admin/laporan" className={btn("outline")}><Download size={18} aria-hidden="true" /> Unduh laporan</Link>} />
      <form action="/admin/transaksi" method="get" role="search" className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-[0.9375rem] font-semibold text-n-900">Cari nama, NIM/ID, atau judul</label>
          <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]"><Search size={20} aria-hidden="true" /><input id="q" name="q" type="search" className={ctl.input} defaultValue={q} /></div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-[0.9375rem] font-semibold text-n-900">Status</label>
          <select id="status" name="status" className={ctl.select} defaultValue={status}><option value="">Semua status</option>{Object.values(LOAN_STATUS).map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1.5"><label htmlFor="from" className="text-[0.9375rem] font-semibold text-n-900">Dari tanggal</label><input id="from" name="from" type="date" className={ctl.input} defaultValue={from} /></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="to" className="text-[0.9375rem] font-semibold text-n-900">Sampai tanggal</label><input id="to" name="to" type="date" className={ctl.input} defaultValue={to} /></div>
        <button className={btn("primary")} type="submit">Terapkan</button>
      </form>
      {data.items.length ? (
        <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
          <table className={T.table}>
            <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Peminjam</th><th className={T.th}>Buku</th><th className={T.th}>Status</th><th className={T.th}>Diajukan</th><th className={T.th}>Jatuh tempo</th><th className={T.th}>Dikembalikan</th><th className={T.th}>Denda</th></tr></thead>
            <tbody className={T.tbody}>
              {data.items.map((l) => (
                <tr key={l.id} className={T.tr}>
                  <td data-label="Peminjam" className={T.td}><b>{l.full_name}</b><br /><small className="text-n-700">{idLabel(l.role)} {l.identity_number}</small></td>
                  <td  data-label="Buku" className={T.tdMain}>{l.title}</td>
                  <td data-label="Status" className={T.td}><StatusBadge status={l.status} />{l.overdue && <> <StatusBadge status="Terlambat" /></>}</td>
                  <td data-label="Diajukan" className={T.td}>{tanggalSingkat(l.requested_at)}</td>
                  <td data-label="Jatuh tempo" className={T.td}>{l.due_date ? tanggalSingkat(l.due_date) : "-"}</td>
                  <td data-label="Dikembalikan" className={T.td}>{l.returned_at ? tanggalSingkat(l.returned_at) : "-"}</td>
                  <td data-label="Denda" className={T.td}>{l.fine_amount ? <><b>{rupiah(l.fine_amount)}</b> <StatusBadge status={l.fine_status} /></> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={ListChecks} title="Transaksi tidak ditemukan" text="Ubah kata kunci, status, atau rentang tanggal." action={<Link href="/admin/transaksi" className={btn("primary")}>Hapus filter</Link>} />
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/admin/transaksi" params={{ q, status, from, to }} />
    </div>
  );
}
