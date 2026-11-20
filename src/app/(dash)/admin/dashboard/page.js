import Link from "next/link";
import { Library, BookCopy, GraduationCap, ArrowLeftRight, Wallet, Users, UsersRound, Tags, ListChecks } from "lucide-react";
import { requireUser } from "@/lib/session";
import { adminStats, searchLoans } from "@/lib/data/loans";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { rupiah, tanggalSingkat } from "@/lib/format";
import { T } from "@/lib/styles";
import { idLabel } from "@/lib/config";

export const metadata = { title: "Dashboard Admin" };

export default async function AdminDashboard() {
  await requireUser(["admin"]);
  const [s, recent] = await Promise.all([adminStats(), searchLoans({ pageSize: 8 })]);
  const nf = new Intl.NumberFormat("id-ID");
  return (
    <div className="grid gap-5">
      <PageHeader title="Dashboard Admin" subtitle="Statistik perpustakaan dan pintasan ke pengelolaan data." />
      <div className="mb-5 grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 md:grid-cols-3">
        <StatCard icon={Library} label="Total judul buku" value={nf.format(s.total_titles)} tone="navy" href="/kelola/buku" />
        <StatCard icon={BookCopy} label="Total eksemplar stok" value={nf.format(s.total_copies)} tone="navy" />
        <StatCard icon={GraduationCap} label="Mahasiswa terdaftar" value={nf.format(s.total_students)} tone="green" href="/admin/users?role=mahasiswa" />
        <StatCard icon={UsersRound} label="Pengunjung umum terdaftar" value={nf.format(s.total_public)} tone="green" href="/admin/users?role=umum" />
        <StatCard icon={ArrowLeftRight} label="Transaksi aktif" value={nf.format(s.active_loans)} tone="yellow" href="/admin/transaksi" />
        <StatCard icon={Wallet} label="Denda yang sudah lunas" value={rupiah(s.paid_fines)} tone="green" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/users" className="flex min-h-[72px] items-center gap-3.5 rounded-lg border border-n-200 bg-white p-4 font-semibold text-navy-800 no-underline hover:shadow-md hover:no-underline [&_small]:block [&_small]:font-normal [&_small]:text-n-700"><Users size={28} aria-hidden="true" /><span>Pengguna<small>Kelola akun</small></span></Link>
        <Link href="/admin/kategori" className="flex min-h-[72px] items-center gap-3.5 rounded-lg border border-n-200 bg-white p-4 font-semibold text-navy-800 no-underline hover:shadow-md hover:no-underline [&_small]:block [&_small]:font-normal [&_small]:text-n-700"><Tags size={28} aria-hidden="true" /><span>Kategori<small>Genre buku</small></span></Link>
        <Link href="/kelola/buku" className="flex min-h-[72px] items-center gap-3.5 rounded-lg border border-n-200 bg-white p-4 font-semibold text-navy-800 no-underline hover:shadow-md hover:no-underline [&_small]:block [&_small]:font-normal [&_small]:text-n-700"><BookCopy size={28} aria-hidden="true" /><span>Buku<small>Koleksi dan stok</small></span></Link>
        <Link href="/admin/transaksi" className="flex min-h-[72px] items-center gap-3.5 rounded-lg border border-n-200 bg-white p-4 font-semibold text-navy-800 no-underline hover:shadow-md hover:no-underline [&_small]:block [&_small]:font-normal [&_small]:text-n-700"><ListChecks size={28} aria-hidden="true" /><span>Monitoring<small>Seluruh transaksi</small></span></Link>
      </div>
      <section aria-labelledby="h-log">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 [&_h2]:m-0"><h2 id="h-log">Transaksi terbaru</h2><Link href="/admin/transaksi" className="font-semibold underline underline-offset-[3px]">Lihat semua</Link></div>
        <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
          <table className={T.table}>
            <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Peminjam</th><th className={T.th}>Buku</th><th className={T.th}>Status</th><th className={T.th}>Diajukan</th></tr></thead>
            <tbody className={T.tbody}>
              {recent.items.map((l) => (
                <tr key={l.id} className={T.tr}>
                  <td data-label="Peminjam" className={T.td}><b>{l.full_name}</b><br /><small className="text-n-700">{idLabel(l.role)} {l.identity_number}</small></td>
                  <td  data-label="Buku" className={T.tdMain}>{l.title}</td>
                  <td data-label="Status" className={T.td}><StatusBadge status={l.status} />{l.overdue && <> <StatusBadge status="Terlambat" /></>}</td>
                  <td data-label="Diajukan" className={T.td}>{tanggalSingkat(l.requested_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
