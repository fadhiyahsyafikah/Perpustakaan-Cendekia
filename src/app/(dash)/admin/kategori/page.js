import Link from "next/link";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { requireUser } from "@/lib/session";
import { paginatedCategories } from "@/lib/data/books";
import { PageHeader, EmptyState, Pagination } from "@/components/ui";
import ConfirmForm from "@/components/ConfirmForm";
import { deleteCategory } from "@/actions/categories";
import { T, btn } from "@/lib/styles";

export const metadata = { title: "Kategori Buku" };

export default async function KategoriPage({ searchParams }) {
  await requireUser(["admin"]);
  const sp = await searchParams;
  const { items: cats, page, pages } = await paginatedCategories({
    halaman: sp?.halaman ?? sp?.page,
    pageSize: 10,
  });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Kategori Buku"
        subtitle="Kategori yang masih memiliki buku tidak dapat dihapus."
        actions={
          <Link href="/admin/kategori/baru" className={btn("primary")}>
            <Plus size={18} aria-hidden="true" /> Tambah kategori
          </Link>
        }
      />
      {cats.length ? (
        <>
          <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
            <table className={T.table}>
              <thead className={T.thead}>
                <tr className={T.tr}>
                  <th className={T.th}>Kategori</th>
                  <th className={T.th}>Kode</th>
                  <th className={T.th}>Deskripsi</th>
                  <th className={T.thRight}>Jumlah buku</th>
                  <th className={T.thRight}>Aksi</th>
                </tr>
              </thead>
              <tbody className={T.tbody}>
                {cats.map((c) => (
                  <tr key={c.id} className={T.tr}>
                    <td data-label="Kategori" className={T.tdMain}><b>{c.name}</b></td>
                    <td data-label="Kode" className={T.td}>
                      <span className="inline-block max-w-full rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">
                        {c.code}
                      </span>
                    </td>
                    <td data-label="Deskripsi" className={T.td}>{c.description || <span className="text-n-700">-</span>}</td>
                    <td data-label="Jumlah buku" className={T.tdNum}>{c.book_count}</td>
                    <td data-label="Aksi" className={T.tdActions}>
                      <Link href={`/admin/kategori/${c.id}`} className={btn("outline", "sm")}>
                        <Pencil size={16} aria-hidden="true" /> Ubah
                      </Link>
                      <ConfirmForm
                        action={deleteCategory}
                        fields={{ id: c.id }}
                        triggerLabel="Hapus"
                        triggerIcon={<Trash2 size={18} aria-hidden="true" />}
                        triggerVariant="danger"
                        title="Hapus kategori ini?"
                        description={
                          c.all_book_count > 0
                            ? `Kategori ${c.name} masih dipakai buku dan tidak dapat dihapus.`
                            : `Hapus kategori ${c.name}? Tindakan ini tidak dapat dibatalkan.`
                        }
                        confirmLabel="Ya, hapus"
                        confirmVariant="danger"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} basePath="/admin/kategori" />
        </>
      ) : (
        <EmptyState icon={Tags} title="Belum ada kategori" text="Tambahkan kategori agar buku dapat dikelompokkan." />
      )}
    </div>
  );
}