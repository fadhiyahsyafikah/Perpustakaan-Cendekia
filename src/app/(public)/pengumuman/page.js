import Link from "next/link";
import { Megaphone } from "lucide-react";
import { AnnouncementCard, EmptyState, Pagination } from "@/components/ui";
import { listPublicAnnouncements } from "@/lib/data/announcements";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/config";
import { str } from "@/lib/format";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Pengumuman" };

export default async function PengumumanPage({ searchParams }) {
  const sp = await searchParams;
  const kategori = ANNOUNCEMENT_CATEGORIES.includes(str(sp.kategori)) ? str(sp.kategori) : "";
  const data = await listPublicAnnouncements({ kategori, halaman: str(sp.halaman) });
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-7 pb-2">
      <h1>Pengumuman</h1>
      <p className="mt-0 mb-[18px] max-w-[62ch] text-n-700">Informasi operasional, layanan, dan acara dari Perpustakaan Cendekia.</p>
      <nav className="mb-[18px] flex gap-1 overflow-x-auto border-b-2 border-n-200 [&_a]:-mb-0.5 [&_a]:border-b-[3px] [&_a]:border-transparent [&_a]:px-4 [&_a]:py-3 [&_a]:font-semibold [&_a]:whitespace-nowrap [&_a]:text-n-700 [&_a]:no-underline" aria-label="Kategori pengumuman">
        <Link href="/pengumuman" className={!kategori ? "border-yellow-500! text-navy-800!" : ""}>Semua</Link>
        {ANNOUNCEMENT_CATEGORIES.map((c) => (
          <Link key={c} href={`/pengumuman?kategori=${c}`} className={kategori === c ? "border-yellow-500! text-navy-800!" : ""}>{c}</Link>
        ))}
      </nav>
      {data.items.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{data.items.map((a) => <AnnouncementCard key={a.id} item={a} />)}</div>
          <Pagination page={data.page} pages={data.pages} basePath="/pengumuman" params={{ kategori }} />
        </>
      ) : (
        <EmptyState icon={Megaphone} title="Belum ada pengumuman" text="Belum ada pengumuman pada kategori ini." />
      )}
    </div>
  );
}
