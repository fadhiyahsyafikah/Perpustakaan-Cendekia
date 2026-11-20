import { requireUser } from "@/lib/session";
import { extensionQueue } from "@/lib/data/loans";
import { PageHeader } from "@/components/ui";
import { ExtensionTable } from "@/components/staff";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
