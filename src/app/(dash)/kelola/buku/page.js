import Link from "next/link";
import { Plus, Pencil, Trash2, Search, BookCopy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { searchBooks, listCategoryOptions } from "@/lib/data/books";
import { PageHeader, EmptyState, Pagination } from "@/components/ui";
import BookCover from "@/components/BookCover";
import ConfirmForm from "@/components/ConfirmForm";
import { deleteBook } from "@/actions/books";
import { CONFIG } from "@/lib/config";
import { str } from "@/lib/format";
import { T, btn, ctl, cx, stock } from "@/lib/styles";

export const metadata = { title: "Kelola Buku" };

export default async function KelolaBuku({ searchParams }) {
  await requireUser(["pegawai", "admin"]);
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const kategori = str(sp.kategori);
  const [data, cats] = await Promise.all([
    searchBooks({ q, kategori, urut: "judul", halaman: str(sp.halaman), pageSize: CONFIG.ADMIN_PAGE_SIZE }),
    listCategoryOptions(),
  ]);
  return (
    <div className="grid gap-5">
      <PageHeader
        title="Kelola Buku"
        subtitle={`${data.total} buku dalam koleksi. Tambah, ubah, atau hapus buku dan stoknya.`}
        actions={<Link href="/kelola/buku/baru" className={btn("primary")}><Plus size={18} aria-hidden="true" /> Tambah buku</Link>}
      />
      <form action="/kelola/buku" method="get" role="search" className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-[0.9375rem] font-semibold text-n-900">Cari judul, ISBN, atau pengarang</label>
          <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]"><Search size={20} aria-hidden="true" /><input id="q" name="q" type="search" className={ctl.input} defaultValue={q} /></div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kategori" className="text-[0.9375rem] font-semibold text-n-900">Kategori</label>
          <select id="kategori" name="kategori" className={ctl.select} defaultValue={kategori}>
            <option value="">Semua kategori</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className={btn("primary")} type="submit">Terapkan</button>
      </form>

      {data.items.length ? (
        <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
          <table className={T.table}>
            <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Buku</th><th className={T.th}>ISBN</th><th className={T.th}>Kategori</th><th className={T.thRight}>Stok total</th><th className={T.thRight}>Tersedia</th><th className={T.thRight}>Aksi</th></tr></thead>
            <tbody className={T.tbody}>
              {data.items.map((b) => {
                const isStockComplete = Number(b.available_stock) >= Number(b.total_stock);
                return (
                  <tr key={b.id} className={T.tr}>
                    <td data-label="Buku" className={T.tdMain}>
                      <div className="flex min-w-0 items-center gap-3 [&_b]:block [&_b]:text-n-900 [&_small]:text-n-700"><BookCover src={b.cover_url} title={b.title} small /><div><b>{b.title}</b><small>{b.author}, {b.publish_year}</small></div></div>
                    </td>
                    <td data-label="ISBN" className={T.td}>{b.isbn}</td>
                    <td data-label="Kategori" className={T.td}><span className="inline-block max-w-full rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{b.category_name}</span></td>
                    <td data-label="Stok total" className={T.tdNum}>{b.total_stock}</td>
                    <td data-label="Tersedia" className={T.tdNum}><span className={stock(b.available_stock > 0)}>{b.available_stock}</span></td>
                    <td data-label="Aksi" className={T.tdActions}>
                      <Link href={`/kelola/buku/${b.id}`} className={btn("outline", "sm")}><Pencil size={16} aria-hidden="true" /> Ubah</Link>
                      {isStockComplete ? (
                        <ConfirmForm
                          action={deleteBook}
                          fields={{ id: b.id }}
                          triggerLabel="Hapus"
                          triggerIcon={<Trash2 size={18} aria-hidden="true" />}
                          triggerVariant="danger"
                          title="Hapus buku ini?"
                          description={`Hapus buku ${b.title}? Tindakan ini tidak dapat dibatalkan. Riwayat transaksi dan ulasan tetap tersimpan.`}
                          confirmLabel="Ya, hapus"
                          confirmVariant="danger"
                        />
                      ) : (
                        <button
                          type="button"
                          disabled
                          title={`Tidak dapat dihapus karena stok belum lengkap (${b.available_stock}/${b.total_stock} tersedia)`}
                          className={cx(btn("danger", "sm"), "cursor-not-allowed opacity-50")}
                        >
                          <Trash2 size={18} aria-hidden="true" /> Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={BookCopy} title="Buku tidak ditemukan" text="Coba kata kunci lain atau hapus filter." action={<Link href="/kelola/buku" className={btn("primary")}>Tampilkan semua</Link>} />
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/kelola/buku" params={{ q, kategori }} />
    </div>
  );
}