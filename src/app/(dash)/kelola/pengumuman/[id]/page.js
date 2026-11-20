import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getAnnouncement } from "@/lib/data/announcements";
import { PageHeader } from "@/components/ui";
import { AnnouncementForm } from "@/components/forms";
import { updateAnnouncement } from "@/actions/announcements";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Ubah Pengumuman" };

export default async function UbahPengumuman({ params }) {
  await requireUser(["pegawai", "admin"]);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const item = await getAnnouncement(Number(id));
  if (!item) notFound();
  return (
    <div className="grid max-w-[860px] gap-5">
      <PageHeader title="Ubah Pengumuman" subtitle={item.title} back={{ href: "/kelola/pengumuman", label: "Kembali ke daftar" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><AnnouncementForm action={updateAnnouncement} item={item} /></div>
    </div>
  );
}
