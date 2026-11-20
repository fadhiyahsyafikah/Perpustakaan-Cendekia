import Link from "next/link";
import { ClipboardCheck, RefreshCw, Wallet, BookOpen, ClockAlert, BookCopy, Megaphone, Search } from "lucide-react";
import { requireUser } from "@/lib/session";
import { pendingLoanQueue, staffCounts } from "@/lib/data/loans";
import { PageHeader, StatCard } from "@/components/ui";
import { PendingTable } from "@/components/staff";
import { rupiah } from "@/lib/format";
import { btn, ctl } from "@/lib/styles";

export const metadata = { title: "Dashboard Pegawai" };

export default async function PegawaiDashboard() {
  await requireUser(["pegawai"]);
  const [c, queue] = await Promise.all([staffCounts(), pendingLoanQueue()]);
  return (
    <div className="grid gap-5">
      <PageHeader title="Dashboard Pegawai" subtitle="Ringkasan pekerjaan sirkulasi hari ini." />
      <div className="mb-5 grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={ClipboardCheck} label="Antrean peminjaman" value={c.pending} tone="yellow" href="/pegawai/peminjaman" />
        <StatCard icon={RefreshCw} label="Antrean perpanjangan" value={c.extensions} tone="yellow" href="/pegawai/perpanjangan" />
        <StatCard icon={BookOpen} label="Buku sedang dipinjam" value={c.borrowed} tone="navy" href="/pegawai/pengembalian" />
        <StatCard icon={ClockAlert} label="Lewat jatuh tempo" value={c.overdue} tone={c.overdue ? "red" : "green"} href="/pegawai/pengembalian" />
        <StatCard icon={Wallet} label={`Denda tertunggak (${c.fines_open})`} value={rupiah(c.fines_open_total)} tone={c.fines_open ? "red" : "green"} href="/pegawai/denda" />
      </div>

      <section aria-labelledby="h-antre">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 [&_h2]:m-0"><h2 id="h-antre">Antrean verifikasi peminjaman</h2><Link href="/pegawai/peminjaman" className="font-semibold underline underline-offset-[3px]">Buka halaman penuh</Link></div>
        <PendingTable rows={queue.slice(0, 8)} />
      </section>

      <section className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="h-meja">
        <h2 id="h-meja">Meja sirkulasi</h2>
        <p className="text-n-700">Cari transaksi aktif untuk memproses pengembalian. Denda dihitung otomatis.</p>
        <form action="/pegawai/pengembalian" method="get" role="search" className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="q" className="text-[0.9375rem] font-semibold text-n-900">NIM/ID, nama peminjam, atau judul buku</label>
            <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]"><Search size={20} aria-hidden="true" /><input id="q" name="q" type="search" className={ctl.input} placeholder="Contoh: 2024002" /></div>
          </div>
          <button className={btn("primary")} type="submit">Cari transaksi</button>
        </form>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/kelola/buku" className="flex min-h-[72px] items-center gap-3.5 rounded-lg border border-n-200 bg-white p-4 font-semibold text-navy-800 no-underline hover:shadow-md hover:no-underline [&_small]:block [&_small]:font-normal [&_small]:text-n-700"><BookCopy size={28} aria-hidden="true" /><span>Kelola Buku<small>Tambah, ubah, atau hapus koleksi dan stok</small></span></Link>
        <Link href="/kelola/pengumuman" className="flex min-h-[72px] items-center gap-3.5 rounded-lg border border-n-200 bg-white p-4 font-semibold text-navy-800 no-underline hover:shadow-md hover:no-underline [&_small]:block [&_small]:font-normal [&_small]:text-n-700"><Megaphone size={28} aria-hidden="true" /><span>Kelola Pengumuman<small>Tulis dan terbitkan informasi layanan</small></span></Link>
      </div>
    </div>
  );
}
