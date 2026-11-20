import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getBookForEdit, listCategoryOptions } from "@/lib/data/books";
import { PageHeader } from "@/components/ui";
import { BookForm } from "@/components/forms";
import { updateBook } from "@/actions/books";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Ubah Buku" };

export default async function UbahBuku({ params }) {
  await requireUser(["pegawai", "admin"]);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [book, cats] = await Promise.all([getBookForEdit(Number(id)), listCategoryOptions()]);
  if (!book) notFound();
  return (
    <div className="grid max-w-[860px] gap-5">
      <PageHeader title="Ubah Buku" subtitle={book.title} back={{ href: "/kelola/buku", label: "Kembali ke daftar buku" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><BookForm action={updateBook} book={book} categories={cats} /></div>
    </div>
  );
}
