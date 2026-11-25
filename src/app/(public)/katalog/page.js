import Link from "next/link";
import { SearchX } from "lucide-react";
import { BookCard, EmptyState, Pagination } from "@/components/ui";
import KatalogFilter from "@/components/KatalogFilter";
import { searchBooks, listCategoryOptions, SORT_OPTIONS } from "@/lib/data/books";
import { str } from "@/lib/format";
import { btn } from "@/lib/styles";

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

      <KatalogFilter q={q} kategori={kategori} urut={urut} categories={cats} sortOptions={SORT_OPTIONS} />

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