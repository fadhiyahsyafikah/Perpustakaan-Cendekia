import Link from "next/link";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listAnnouncementsManage } from "@/lib/data/announcements";
import { PageHeader, EmptyState, Pagination, StatusBadge, Badge } from "@/components/ui";
import ConfirmForm from "@/components/ConfirmForm";
import { deleteAnnouncement } from "@/actions/announcements";
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_STATUSES } from "@/lib/config";
import { str, tanggalSingkat } from "@/lib/format";
import { T, btn, ctl } from "@/lib/styles";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Kelola Pengumuman" };

export default async function KelolaPengumuman({ searchParams }) {
  await requireUser(["pegawai", "admin"]);
  const sp = await searchParams;
  const status = ANNOUNCEMENT_STATUSES.includes(str(sp.status)) ? str(sp.status) : "";
  const kategori = ANNOUNCEMENT_CATEGORIES.includes(str(sp.kategori)) ? str(sp.kategori) : "";
  const data = await listAnnouncementsManage({ status, kategori, halaman: str(sp.halaman) });
  return (
    <div className="grid gap-5">
      <PageHeader title="Kelola Pengumuman" subtitle="Pengumuman berstatus Published dengan tanggal rilis hari ini atau sebelumnya tampil di halaman publik." actions={<Link href="/kelola/pengumuman/baru" className={btn("primary")}><Plus size={18} aria-hidden="true" /> Tulis pengumuman</Link>} />
      <form action="/kelola/pengumuman" method="get" className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-[0.9375rem] font-semibold text-n-900">Status</label>
          <select id="status" name="status" className={ctl.select} defaultValue={status}><option value="">Semua status</option>{ANNOUNCEMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kategori" className="text-[0.9375rem] font-semibold text-n-900">Kategori</label>
          <select id="kategori" name="kategori" className={ctl.select} defaultValue={kategori}><option value="">Semua kategori</option>{ANNOUNCEMENT_CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <button className={btn("primary")} type="submit">Terapkan</button>
      </form>
      {data.items.length ? (
        <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
          <table className={T.table}>
            <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Judul</th><th className={T.th}>Kategori</th><th className={T.th}>Status</th><th className={T.th}>Tanggal rilis</th><th className={T.thRight}>Aksi</th></tr></thead>
            <tbody className={T.tbody}>
              {data.items.map((a) => (
                <tr key={a.id} className={T.tr}>
                  <td  data-label="Judul" className={T.tdMain}><b>{a.title}</b><br /><small className="text-n-700">Oleh {a.author}</small></td>
                  <td data-label="Kategori" className={T.td}><span className="inline-block max-w-full rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{a.category}</span></td>
                  <td data-label="Status" className={T.td}><StatusBadge status={a.status} />{a.status === "Published" && !a.is_live && <> <Badge tone="warning">Belum tayang</Badge></>}</td>
                  <td data-label="Tanggal rilis" className={T.td}>{tanggalSingkat(a.release_date)}</td>
                  <td  data-label="Aksi" className={T.tdActions}>
                    <Link href={`/kelola/pengumuman/${a.id}`} className={btn("outline", "sm")}><Pencil size={16} aria-hidden="true" /> Ubah</Link>
                    <ConfirmForm action={deleteAnnouncement} fields={{ id: a.id }} triggerLabel="Hapus" triggerIcon={<Trash2 size={18} aria-hidden="true" />} triggerVariant="danger" title="Hapus pengumuman ini?" description={`Hapus pengumuman "${a.title}"? Tindakan ini tidak dapat dibatalkan.`} confirmLabel="Ya, hapus" confirmVariant="danger" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Megaphone} title="Belum ada pengumuman" text="Tulis pengumuman pertama Anda." action={<Link href="/kelola/pengumuman/baru" className={btn("primary")}>Tulis pengumuman</Link>} />
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/kelola/pengumuman" params={{ status, kategori }} />
    </div>
  );
}
