import { requireUser } from "@/lib/session";
import { circulationLoans } from "@/lib/data/loans";
import { PageHeader } from "@/components/ui";
import { CirculationTable, SearchBar } from "@/components/staff";
import { str } from "@/lib/format";

export const metadata = { title: "Meja Sirkulasi" };

export default async function PengembalianPage({ searchParams }) {
  await requireUser(["pegawai"]);
  const q = str((await searchParams).q).trim();
  const rows = await circulationLoans(q);
  return (
    <div className="grid gap-5">
      <PageHeader title="Meja Sirkulasi" subtitle="Terima pengembalian buku fisik. Stok bertambah otomatis dan denda dihitung bila terlambat." />
      <SearchBar action="/pegawai/pengembalian" q={q} placeholder="NIM/ID, nama, atau judul buku" />
      <CirculationTable rows={rows} />
    </div>
  );
}
