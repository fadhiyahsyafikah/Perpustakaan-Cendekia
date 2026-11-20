import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { BookCard, EmptyState, Pagination } from "@/components/ui";
import MobileCollapse from "@/components/MobileCollapse";
import { searchBooks, listCategoryOptions, SORT_OPTIONS } from "@/lib/data/books";
import { str } from "@/lib/format";
import { btn, ctl } from "@/lib/styles";

export const metadata = { title: "Katalog Buku" };

export default async function KatalogPage({ searchParams }) {
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const kategori = str(sp.kategori);
  const urut = SORT_OPTIONS.some((s) => s.value === str(sp.urut)) ? str(sp.urut) : "judul";
  const [data, cats] = await Promise.all([searchBooks({ q, kategori, urut, halaman: str(sp.halaman) }), listCategoryOptions()]);
  const catName = cats.find((c) => String(c.id) === kategori)?.name;
  const filtered = q || kategori;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-7 pb-2">
      <h1>Katalog Buku</h1>
      <p className="mt-0 mb-5 max-w-[62ch] text-n-700">Cari buku berdasarkan judul atau pengarang, lalu saring menurut kategori.</p>

      <form action="/katalog" method="get" role="search" className="mb-5 rounded-lg bg-navy-50 p-4">
        <MobileCollapse>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1.2fr_auto]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q" className="text-[0.9375rem] font-semibold text-n-900">Cari judul atau pengarang</label>
              <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]">
                <Search size={20} aria-hidden="true" />
                <input id="q" name="q" type="search" className={ctl.input} defaultValue={q} placeholder="Contoh: Laskar Pelangi" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kategori" className="text-[0.9375rem] font-semibold text-n-900">Kategori</label>
              <select id="kategori" name="kategori" className={ctl.select} defaultValue={kategori}>
                <option value="">Semua kategori</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="urut" className="text-[0.9375rem] font-semibold text-n-900">Urutkan</label>
              <select id="urut" name="urut" className={ctl.select} defaultValue={urut}>
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button type="submit" className={btn("primary")}>Terapkan</button>
          </div>
        </MobileCollapse>
      </form>

      <p className="mt-0 mb-4 text-n-700" aria-live="polite">
        Menampilkan <b>{data.total}</b> buku
        {q && <> untuk &ldquo;<b>{q}</b>&rdquo;</>}
        {catName && <> dalam kategori <b>{catName}</b></>}
        {filtered && <> &middot; <Link href="/katalog">Hapus filter</Link></>}
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
