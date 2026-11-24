import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { BookCard, EmptyState, Pagination } from "@/components/ui";
import MobileCollapse from "@/components/MobileCollapse";
import { searchBooks, listCategoryOptions, SORT_OPTIONS } from "@/lib/data/books";
import { str } from "@/lib/format";
import { btn, ctl, cx } from "@/lib/styles";

export const metadata = { title: "Katalog Buku" };

export default async function KatalogPage({ searchParams }) {
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const kategori = str(sp.kategori);
  const urut = SORT_OPTIONS.some((s) => s.value === str(sp.urut)) ? str(sp.urut) : "judul";
  const [data, cats] = await Promise.all([searchBooks({ q, kategori, urut, halaman: str(sp.halaman) }), listCategoryOptions()]);
  const catName = cats.find((c) => String(c.id) === kategori)?.name;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-7 pb-2">
      <h1>Katalog Buku</h1>
      <p className="mt-0 mb-5 max-w-[62ch] text-n-700">Cari buku berdasarkan judul atau pengarang, lalu saring menurut kategori.</p>

      <form
        key={`${q}-${kategori}-${urut}`}
        action="/katalog"
        method="get"
        role="search"
        className="mb-5 rounded-xl border border-n-200 bg-white p-4 shadow-sm"
      >
        <MobileCollapse>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_150px]">
            <div className="relative md:col-span-2 md:row-start-1 [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]">
              <Search size={20} aria-hidden="true" />
              <input
                id="q"
                name="q"
                type="search"
                aria-label="Cari judul buku atau nama pengarang"
                className={cx(ctl.input, "h-11")}
                defaultValue={q}
                placeholder="Cari judul buku atau nama pengarang..."
              />
            </div>

            <select
              id="kategori"
              name="kategori"
              aria-label="Filter kategori buku"
              className={cx(ctl.select, "h-11 md:col-start-1 md:row-start-2")}
              defaultValue={kategori}
            >
              <option value="">Kategori: Semua kategori</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  Kategori: {c.name}
                </option>
              ))}
            </select>

            <select
              id="urut"
              name="urut"
              aria-label="Urutkan daftar buku"
              className={cx(ctl.select, "h-11 md:col-start-2 md:row-start-2")}
              defaultValue={urut}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Urutkan: {s.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className={cx(btn("primary"), "h-11 w-full justify-center md:col-start-3 md:row-start-1")}
            >
              Terapkan
            </button>

            <Link
              href="/katalog"
              className={cx(
                btn("outline"),
                "h-11 w-full justify-center bg-white no-underline hover:bg-navy-50 hover:no-underline md:col-start-3 md:row-start-2"
              )}
            >
              Hapus
            </Link>
          </div>
        </MobileCollapse>
      </form>

      <p className="mt-0 mb-4 text-n-700" aria-live="polite">
        Menampilkan <b>{data.total}</b> buku
        {q && <> untuk &ldquo;<b>{q}</b>&rdquo;</>}
        {catName && <> dalam kategori <b>{catName}</b></>}
      </p>

      {data.items.length ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {data.items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
          <Pagination page={data.page} pages={data.pages} basePath="/katalog" params={{ q, kategori, urut: urut === "judul" ? "" : urut }} />
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Buku tidak ditemukan"
          text="Tidak ada buku yang cocok. Coba kata kunci lain atau hapus filter."
          action={<Link href="/katalog" className={btn("primary")}>Tampilkan semua buku</Link>}
        />
      )}
    </div>
  );
}