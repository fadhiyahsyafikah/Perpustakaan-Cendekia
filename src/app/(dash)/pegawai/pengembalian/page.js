import { requireUser } from "@/lib/session";
import { circulationLoans } from "@/lib/data/loans";
import { PageHeader } from "@/components/ui";
import { CirculationTable, SearchBar } from "@/components/staff";
import { str } from "@/lib/format";

export const metadata = { title: "Meja Layanan" };

export default async function PengembalianPage({ searchParams }) {
  await requireUser(["pegawai"]);
  const q = str((await searchParams).q).trim();
  const rows = await circulationLoans(q);
  return (
    <div className="grid gap-5">
      <PageHeader title="Meja Layanan" subtitle="Terima pengembalian buku fisik." />
      <SearchBar action="/pegawai/pengembalian" q={q} placeholder="NIM/ID, nama, atau judul buku" />
      <CirculationTable rows={rows} />
    </div>
  );
}
