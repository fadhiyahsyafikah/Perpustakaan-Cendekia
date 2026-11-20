import { requireUser } from "@/lib/session";
import { extensionQueue } from "@/lib/data/loans";
import { PageHeader } from "@/components/ui";
import { ExtensionTable } from "@/components/staff";

export const metadata = { title: "Antrean Perpanjangan" };

export default async function PerpanjanganPage() {
  await requireUser(["pegawai"]);
  const rows = await extensionQueue();
  return (
    <div className="grid gap-5">
      <PageHeader title="Antrean Perpanjangan" subtitle="Jika disetujui, jatuh tempo bertambah otomatis sebesar durasi maksimal pinjam buku." />
      <ExtensionTable rows={rows} />
    </div>
  );
}
