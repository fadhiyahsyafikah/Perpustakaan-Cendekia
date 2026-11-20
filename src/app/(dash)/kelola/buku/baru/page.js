import { requireUser } from "@/lib/session";
import { listCategoryOptions } from "@/lib/data/books";
import { PageHeader } from "@/components/ui";
import { BookForm } from "@/components/forms";
import { createBook } from "@/actions/books";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Tambah Buku" };

export default async function BukuBaru() {
  await requireUser(["pegawai", "admin"]);
  const cats = await listCategoryOptions();
  return (
    <div className="grid max-w-[860px] gap-5">
      <PageHeader title="Tambah Buku" back={{ href: "/kelola/buku", label: "Kembali ke daftar buku" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><BookForm action={createBook} categories={cats} /></div>
    </div>
  );
}
