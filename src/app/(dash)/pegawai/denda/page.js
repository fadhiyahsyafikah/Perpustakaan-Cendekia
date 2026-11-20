import Link from "next/link";
import { requireUser } from "@/lib/session";
import { finesList } from "@/lib/data/loans";
import { PageHeader } from "@/components/ui";
import { FineTable, SearchBar } from "@/components/staff";
import { str } from "@/lib/format";

export const metadata = { title: "Daftar Denda" };

export default async function DendaPage({ searchParams }) {
  await requireUser(["pegawai"]);
  const sp = await searchParams;
  const status = str(sp.status) === "Lunas" ? "Lunas" : "Tertunggak";
  const q = str(sp.q).trim();
  const rows = await finesList({ status, q });
  return (
    <div className="grid gap-5">
      <PageHeader title="Daftar Denda" subtitle="Denda dibayar tunai di meja sirkulasi. Catat pelunasan agar blokir mahasiswa terbuka." />
      <nav className="mb-[18px] flex gap-1 overflow-x-auto border-b-2 border-n-200 [&_a]:-mb-0.5 [&_a]:border-b-[3px] [&_a]:border-transparent [&_a]:px-4 [&_a]:py-3 [&_a]:font-semibold [&_a]:whitespace-nowrap [&_a]:text-n-700 [&_a]:no-underline" aria-label="Status denda">
        <Link href="/pegawai/denda" className={status === "Tertunggak" ? "border-yellow-500! text-navy-800!" : ""}>Tertunggak</Link>
        <Link href="/pegawai/denda?status=Lunas" className={status === "Lunas" ? "border-yellow-500! text-navy-800!" : ""}>Sudah lunas</Link>
      </nav>
      <SearchBar action="/pegawai/denda" q={q} placeholder="NIM/ID, nama, atau judul buku" extra={status === "Lunas" ? <input type="hidden" name="status" value="Lunas" /> : null} />
      <FineTable rows={rows} paid={status === "Lunas"} />
    </div>
  );
}
