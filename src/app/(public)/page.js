import Link from "next/link";
import { Search, Megaphone, BookOpenCheck, ClipboardList, Handshake, Undo2 } from "lucide-react";
import { BookCard, AnnouncementCard, EmptyState } from "@/components/ui";
import { topBooks } from "@/lib/data/books";
import { latestAnnouncements } from "@/lib/data/announcements";
import { getCurrentUser } from "@/lib/session";
import { btn, ctl } from "@/lib/styles";

export const metadata = { title: "Beranda" };

export default async function HomePage() {
const [top, news, user] = await Promise.all([topBooks(5), latestAnnouncements(3), getCurrentUser()]);
  return (
    <>
      <section className="mx-auto w-full max-w-[1200px] px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-navy-800 px-6 py-11 text-white shadow-md sm:px-12 sm:py-14 lg:px-20 lg:py-16">
          <h1 className="max-w-[680px] text-3xl leading-[1.18] font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Temukan buku, <span className="text-yellow-500">tambah ilmu,</span> pinjam dengan mudah.
          </h1>
          <p className="mt-3.5 mb-0 max-w-[560px] text-base leading-relaxed text-navy-100 sm:text-[1.0625rem]">
            Perpustakaan Cendekia membantu Anda mencari buku, mengajukan peminjaman, dan memantau jatuh tempo, semuanya dari satu tempat.
          </p>

          <form
            action="/katalog"
            method="get"
            role="search"
            className="mt-7 flex flex-col gap-2.5 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center sm:rounded-full sm:pl-6"
          >
            <label htmlFor="hero-search" className="sr-only">
              Cari judul buku atau nama pengarang
            </label>
            <div className="flex flex-1 items-center gap-3 px-2 sm:px-0">
              <Search size={20} className="shrink-0 text-n-500" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                name="q"
                placeholder="Ketik judul buku atau nama pengarang..."
                className="w-full border-0 bg-transparent py-2.5 text-[0.9375rem] text-n-900 placeholder:text-n-500 focus:outline-none focus-visible:shadow-none"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-yellow-500 px-7 py-3.5 text-[0.9375rem] font-semibold whitespace-nowrap text-navy-800 transition hover:bg-yellow-600 sm:rounded-full"
            >
              Telusuri Katalog
            </button>
          </form>

          <p className="mt-3.5 mb-0 text-sm text-navy-100/90">
            Contoh: Laskar Pelangi, Tere Liye, Clean Code
          </p>
        </div>
      </section>

      <section className="py-10 mx-auto w-full max-w-1200px px-4 sm:px-6 lg:px-8" aria-labelledby="h-top">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 [&_h2]:m-0 [&_h2]:text-2xl [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-n-700">
          <div>
            <h2 id="h-top">Buku Terpopuler</h2>
            <p>Lima buku yang paling sering dipinjam.</p>
          </div>
          <Link href="/katalog" className="font-semibold underline underline-offset-[3px]">Lihat semua buku</Link>
        </div>
        {top.length ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-1 pb-3.5 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:p-0 lg:grid-cols-5 lg:gap-5 [&>*]:flex-[0_0_62%] [&>*]:snap-start sm:[&>*]:flex-none">
            {top.map((b, i) => (
              <BookCard key={b.id} book={b} rank={i + 1} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada data peminjaman" text="Buku terpopuler akan tampil setelah ada transaksi peminjaman." />
        )}
      </section>

      <section className="py-10 mx-auto w-full max-w-1200px px-4 sm:px-6 lg:px-8" aria-labelledby="h-cara">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 [&_h2]:m-0 [&_h2]:text-2xl [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-n-700">
          <div>
            <h2 id="h-cara">Cara meminjam buku</h2>
            <p>Empat langkah mudah, tanpa perlu antre lama.</p>
          </div>
        </div>
        <ol className="[counter-reset:step] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><Search size={18} aria-hidden="true" /> Cari buku</h3><p>Gunakan kolom pencarian atau jelajahi katalog berdasarkan kategori.</p></li>
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><ClipboardList size={18} aria-hidden="true" /> Ajukan pinjam</h3><p>Masuk atau daftar akun, lalu tekan tombol &ldquo;Ajukan Pinjam&rdquo; pada halaman buku.</p></li>
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><Handshake size={18} aria-hidden="true" /> Datang ke meja sirkulasi</h3><p>Pegawai akan memeriksa dan menyetujui pengajuan Anda saat Anda hadir.</p></li>
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><Undo2 size={18} aria-hidden="true" /> Kembalikan tepat waktu</h3><p>Kembalikan sebelum jatuh tempo agar terhindar dari denda.</p></li>
        </ol>
      </section>

      <section className="py-10 mx-auto w-full max-w-1200px px-4 sm:px-6 lg:px-8" aria-labelledby="h-info">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 [&_h2]:m-0 [&_h2]:text-2xl [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-n-700">
          <div>
            <h2 id="h-info"><Megaphone size={24} aria-hidden="true" className="align-[-3px]" /> Pengumuman Terbaru</h2>
            <p>Informasi layanan, jadwal, dan acara perpustakaan.</p>
          </div>
          <Link href="/pengumuman" className="font-semibold underline underline-offset-[3px]">Semua pengumuman</Link>
        </div>
        {news.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {news.map((a) => <AnnouncementCard key={a.id} item={a} />)}
          </div>
        ) : (
          <EmptyState icon={Megaphone} title="Belum ada pengumuman" text="Pengumuman baru dari perpustakaan akan tampil di sini." />
        )}
      </section>

      {!user && (
        <section className="py-10 mx-auto w-full max-w-1200px px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 rounded-[24px] bg-navy-50 p-7 md:flex-row md:items-center md:justify-between md:px-10 md:py-9 [&_h2]:mt-0 [&_h2]:mb-1 [&_p]:m-0 [&_p]:text-n-700">
            <div>
              <h2>Ingin meminjam buku?</h2>
              <p>Mahasiswa mendaftar dengan email kampus, pengunjung umum dengan email apa saja. Gratis dan hanya butuh satu menit.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/register" className={btn("primary", "lg")}><BookOpenCheck size={20} aria-hidden="true" /> Daftar Sekarang</Link>
              <Link href="/login" className={btn("outline", "lg")}>Sudah punya akun? Masuk</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
