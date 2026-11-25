import { requireUser } from "@/lib/session";
import { studentHistory } from "@/lib/data/loans";
import HistoryTable from "@/components/HistoryTable";
import { PageHeader, Pagination } from "@/components/ui";
import { str } from "@/lib/format";
import { BORROWER_ROLES } from "@/lib/config";

export const metadata = { title: "Riwayat Pinjam" };

export default async function RiwayatPage({ searchParams }) {
  const user = await requireUser(BORROWER_ROLES);
  const sp = await searchParams;
  const data = await studentHistory(user.id, { halaman: str(sp.halaman) });
  return (
    <div className="grid gap-5">
      <PageHeader title="Riwayat Pinjam" subtitle="Seluruh transaksi yang sudah selesai atau ditolak. Beri ulasan untuk buku yang sudah Anda kembalikan." back={{ href: "/pengunjung/dashboard", label: "Kembali ke dashboard" }} />
      <HistoryTable items={data.items} />
      <Pagination page={data.page} pages={data.pages} basePath="/pengunjung/riwayat" />
    </div>
  );
}
