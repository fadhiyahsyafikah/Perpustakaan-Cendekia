import { requireUser } from "@/lib/session";
import { pendingLoanQueue } from "@/lib/data/loans";
import { PageHeader } from "@/components/ui";
import { PendingTable, SearchBar } from "@/components/staff";
import { str } from "@/lib/format";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Antrean Peminjaman" };

export default async function PeminjamanPage({ searchParams }) {
  await requireUser(["pegawai"]);
  const q = str((await searchParams).q).trim();
  const rows = await pendingLoanQueue(q);
  return (
    <div className="grid gap-5">
      <PageHeader title="Antrean Peminjaman" subtitle="Permohonan berstatus Menunggu Konfirmasi, diurutkan dari yang terlama. Periksa saat mahasiswa hadir di meja sirkulasi." />
      <SearchBar action="/pegawai/peminjaman" q={q} placeholder="NIM/ID, nama, atau judul buku" />
      <PendingTable rows={rows} />
    </div>
  );
}
