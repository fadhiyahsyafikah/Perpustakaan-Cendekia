import { Download } from "lucide-react";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { LOAN_STATUS } from "@/lib/config";
import { btn, ctl } from "@/lib/styles";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Laporan CSV" };

// Formulir GET biasa ke Route Handler: peramban langsung mengunduh berkas CSV (dapat dibuka di Excel)
export default async function LaporanPage() {
  await requireUser(["admin"]);
  return (
    <div className="grid max-w-[780px] gap-5">
      <PageHeader title="Laporan (CSV / Excel)" subtitle="Unduh data transaksi peminjaman atau rekap denda. Berkas CSV dapat dibuka langsung di Microsoft Excel." />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6">
        <form action="/api/reports/loans.csv" method="get" className="grid gap-[18px]">
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="type" className="text-[0.9375rem] font-semibold text-n-900">Jenis laporan</label>
              <select id="type" name="type" className={ctl.select}><option value="transaksi">Transaksi peminjaman</option><option value="denda">Rekap denda</option></select>
            </div>
            <div className="flex flex-col gap-1.5"><label htmlFor="from" className="text-[0.9375rem] font-semibold text-n-900">Dari tanggal</label><input id="from" name="from" type="date" className={ctl.input} /></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="to" className="text-[0.9375rem] font-semibold text-n-900">Sampai tanggal</label><input id="to" name="to" type="date" className={ctl.input} /></div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="status" className="text-[0.9375rem] font-semibold text-n-900">Status (opsional)</label>
              <select id="status" name="status" className={ctl.select}>
                <option value="">Semua status</option>
                {Object.values(LOAN_STATUS).map((s) => <option key={s}>{s}</option>)}
                <option>Tertunggak</option><option>Lunas</option>
              </select>
              <p className="m-0 text-sm text-n-700">Untuk laporan denda gunakan status Tertunggak atau Lunas.</p>
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3 max-[479px]:[&>*]:basis-full"><button type="submit" className={btn("primary", "lg")}><Download size={20} aria-hidden="true" /> Unduh CSV</button></div>
        </form>
      </div>
    </div>
  );
}
