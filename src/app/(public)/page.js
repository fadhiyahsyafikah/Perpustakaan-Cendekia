import Link from "next/link";
import { Search, Megaphone, BookOpenCheck, ClipboardList, Handshake, Undo2, Crown, ArrowRight } from "lucide-react";
import { BookCard, AnnouncementCard, EmptyState } from "@/components/ui";
import { topBooks } from "@/lib/data/books";
import { latestAnnouncements } from "@/lib/data/announcements";
import { getCurrentUser } from "@/lib/session";
import { btn, cx } from "@/lib/styles";

export const metadata = { title: "Beranda" };

// Konfigurasi posisi & tinggi blok podium untuk setiap peringkat (1 sampai 5) di atas latar putih
const PODIUM_STAGES = [
  {
    rankLabel: "#1",
    colClass:
      "col-span-2 mx-auto w-[74%] order-1 sm:col-span-2 sm:col-start-3 sm:mx-0 sm:w-full lg:col-span-1 lg:col-start-auto lg:order-3 z-10",
    cardClass:
      "[&>*]:border-2 [&>*]:border-yellow-500 [&>*]:shadow-[0_12px_28px_rgba(255,218,3,0.25)]",
    baseClass:
      "h-10 lg:h-[112px] border-t-[3px] border-yellow-500 bg-gradient-to-b from-yellow-100 to-yellow-100/20 text-yellow-700",
  },
  {
    rankLabel: "#2",
    colClass:
      "col-span-1 order-2 sm:col-span-2 sm:col-start-2 lg:col-span-1 lg:col-start-auto lg:order-2",
    cardClass:
      "[&>*]:border-navy-600/35 [&>*]:shadow-sm",
    baseClass:
      "h-8 lg:h-[72px] border-t-2 border-navy-600/50 bg-gradient-to-b from-navy-100/90 to-navy-50/30 text-navy-800",
  },
  {
    rankLabel: "#3",
    colClass:
      "col-span-1 order-3 sm:col-span-2 sm:col-start-4 lg:col-span-1 lg:col-start-auto lg:order-4",
    cardClass:
      "[&>*]:border-navy-600/35 [&>*]:shadow-sm",
    baseClass:
      "h-8 lg:h-[52px] border-t-2 border-navy-600/40 bg-gradient-to-b from-navy-100/70 to-navy-50/20 text-navy-800",
  },
  {
    rankLabel: "#4",
    colClass:
      "col-span-1 order-4 sm:col-span-2 sm:col-start-2 lg:col-span-1 lg:col-start-auto lg:order-1",
    cardClass:
      "[&>*]:border-n-200",
    baseClass:
      "h-7 lg:h-[28px] border-t-2 border-n-300 bg-gradient-to-b from-n-100 to-n-50/40 text-n-700",
  },
  {
    rankLabel: "#5",
    colClass:
      "col-span-1 order-5 sm:col-span-2 sm:col-start-4 lg:col-span-1 lg:col-start-auto lg:order-5",
    cardClass:
      "[&>*]:border-n-200",
    baseClass:
      "h-7 lg:h-[28px] border-t-2 border-n-300 bg-gradient-to-b from-n-100 to-n-50/40 text-n-700",
  },
];

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

      <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="h-top">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 [&_h2]:m-0 [&_h2]:text-2xl [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-n-700">
          <div>
            <h1 id="h-top">Buku Terpopuler</h1>
          </div>
          <Link
            href="/katalog"
            className="group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.9375rem] font-semibold text-navy-800 no-underline transition-all duration-200 hover:bg-navy-50 hover:no-underline"
          >
            <span>Lihat semua buku</span>
            <span className="grid size-6 place-items-center rounded-full bg-navy-50 text-navy-800 transition-all duration-200 group-hover:bg-yellow-500 group-hover:text-navy-900">
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        {top.length ? (
          <div className="relative pt-2">
            {/* Sorotan hangat tipis di belakang Juara 1 */}
            <div
              className="pointer-events-none absolute top-6 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-500/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-6 sm:gap-4 lg:grid-cols-5 lg:items-end lg:gap-4">
              {top.map((b, i) => {
                const stage = PODIUM_STAGES[i] || PODIUM_STAGES[4];
                const isFirst = i === 0;
                return (
                  <div
                    key={b.id}
                    className={cx(
                      "group flex flex-col transition-transform duration-300 hover:-translate-y-1.5",
                      stage.colClass
                    )}
                  >
                    {isFirst && (
                      <div className="mb-2.5 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold tracking-wide text-navy-900 shadow-sm">
                          <Crown size={14} aria-hidden="true" />
                        </span>
                      </div>
                    )}

                    <div className={cx("flex-1", stage.cardClass)}>
                      <BookCard book={b} />
                    </div>

                    {/* Blok Podium Bertingkat */}
                    <div
                      className={cx(
                        "mt-2.5 flex w-full items-center justify-center rounded-t-xl font-heading text-xs font-bold tracking-widest uppercase select-none sm:text-sm",
                        stage.baseClass
                      )}
                      aria-hidden="true"
                    >
                      {stage.rankLabel}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Garis lantai panggung */}
            <div
              className="h-px w-full bg-gradient-to-r from-transparent via-n-300 to-transparent"
              aria-hidden="true"
            />
          </div>
        ) : (
          <EmptyState title="Belum ada data peminjaman" text="Buku terpopuler akan tampil setelah ada transaksi peminjaman." />
        )}
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="h-cara">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 [&_h2]:m-0 [&_h2]:text-2xl [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-n-700">
          <div>
            <h1 id="h-cara">Cara meminjam buku</h1>
          </div>
        </div>
        <ol className="[counter-reset:step] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><Search size={18} aria-hidden="true" /> Cari buku</h3><p>Gunakan kolom pencarian atau jelajahi katalog berdasarkan kategori.</p></li>
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><ClipboardList size={18} aria-hidden="true" /> Ajukan pinjam</h3><p>Masuk atau daftar akun, lalu tekan tombol &ldquo;Ajukan Pinjam&rdquo; pada halaman buku.</p></li>
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><Handshake size={18} aria-hidden="true" /> Datang ke meja sirkulasi</h3><p>Pegawai akan memeriksa dan menyetujui pengajuan Anda saat Anda hadir.</p></li>
          <li className="relative rounded-lg bg-navy-50 p-5 before:mb-2.5 before:grid before:size-9 before:place-items-center before:rounded-full before:bg-yellow-500 before:font-heading before:font-bold before:text-navy-800 before:[counter-increment:step] before:content-[counter(step)] [&_h3]:mb-1 [&_h3]:text-[1.0625rem] [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-n-700"><h3><Undo2 size={18} aria-hidden="true" /> Kembalikan tepat waktu</h3><p>Kembalikan sebelum jatuh tempo agar terhindar dari denda.</p></li>
        </ol>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="h-info">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 [&_h2]:m-0 [&_h2]:text-2xl [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-n-700">
          <div>
            <h1 id="h-info"><Megaphone size={24} aria-hidden="true" className="align-[-3px]" /> Pengumuman Terbaru</h1>
          </div>
          <Link
            href="/pengumuman"
            className="group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.9375rem] font-semibold text-navy-800 no-underline transition-all duration-200 hover:bg-navy-50 hover:no-underline"
          >
            <span>Semua pengumuman</span>
            <span className="grid size-6 place-items-center rounded-full bg-navy-50 text-navy-800 transition-all duration-200 group-hover:bg-yellow-500 group-hover:text-navy-900">
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
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
        <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[24px] bg-navy-50 p-7 md:px-10 md:py-9 lg:flex-row lg:items-center [&_h2]:mt-0 [&_h2]:mb-1 [&_p]:m-0 [&_p]:text-n-700">
            <div className="max-w-[50ch]">
              <h1>Ingin meminjam buku?</h1>
              <p>Mahasiswa mendaftar dengan email kampus, pengunjung umum dengan email apa saja. Gratis dan hanya butuh satu menit.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login" className={cx(btn("outline", "lg"), "whitespace-nowrap")}>
                Sudah punya akun? Masuk
              </Link>
              <Link href="/register" className={cx(btn("primary", "lg"), "whitespace-nowrap")}>
                <BookOpenCheck size={20} aria-hidden="true" /> Daftar Sekarang
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}