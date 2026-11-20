import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicAnnouncement, otherAnnouncements } from "@/lib/data/announcements";
import { tanggal } from "@/lib/format";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const a = /^\d+$/.test(id) ? await getPublicAnnouncement(Number(id)) : null;
  return { title: a ? a.title : "Pengumuman tidak ditemukan" };
}

export default async function AnnouncementDetail({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const a = await getPublicAnnouncement(Number(id));
  if (!a) notFound();
  const others = await otherAnnouncements(a.id);
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-7 pb-2">
      <nav className="mb-4 flex flex-wrap gap-1.5 text-sm text-n-700 [&_a]:text-n-700 [&_[aria-current]]:font-semibold [&_[aria-current]]:text-navy-800" aria-label="Jejak halaman">
        <Link href="/">Beranda</Link> / <Link href="/pengumuman">Pengumuman</Link> / <span aria-current="page">{a.title}</span>
      </nav>
      <article className="max-w-[70ch]">
        <span className="inline-block max-w-full rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{a.category}</span>
        <h1 className="mt-2">{a.title}</h1>
        <p className="text-n-700">Diterbitkan {tanggal(a.release_date)} oleh {a.author}</p>
        {/* Teks di-escape otomatis oleh React (aman dari XSS); baris baru dipertahankan lewat CSS */}
        <div className="[&_p]:mb-4 [&_p]:text-[1.0625rem] [&_p]:leading-[1.75] [&_p]:whitespace-pre-line">
          {a.content.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>
      {others.length > 0 && (
        <section className="mt-10" aria-labelledby="h-lain">
          <h2 id="h-lain" className="text-xl">Pengumuman lainnya</h2>
          <ul className="list-disc pl-[18px]">
            {others.map((o) => (
              <li key={o.id} className="mb-2"><Link href={`/pengumuman/${o.id}`}>{o.title}</Link> <span className="text-n-700 text-sm">({tanggal(o.release_date)})</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
