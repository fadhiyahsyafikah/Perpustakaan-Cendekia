import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { AnnouncementForm } from "@/components/forms";
import { createAnnouncement } from "@/actions/announcements";

export const metadata = { title: "Tulis Pengumuman" };

export default async function PengumumanBaru() {
  await requireUser(["pegawai", "admin"]);
  return (
    <div className="grid max-w-[860px] gap-5">
      <PageHeader title="Tulis Pengumuman" back={{ href: "/kelola/pengumuman", label: "Kembali ke daftar" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><AnnouncementForm action={createAnnouncement} /></div>
    </div>
  );
}
