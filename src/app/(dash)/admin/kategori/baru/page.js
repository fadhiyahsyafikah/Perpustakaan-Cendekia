import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { CategoryForm } from "@/components/forms";
import { createCategory } from "@/actions/categories";

export const metadata = { title: "Tambah Kategori" };

export default async function KategoriBaru() {
  await requireUser(["admin"]);
  return (
    <div className="grid max-w-[720px] gap-5">
      <PageHeader title="Tambah Kategori" back={{ href: "/admin/kategori", label: "Kembali ke daftar kategori" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><CategoryForm action={createCategory} /></div>
    </div>
  );
}
