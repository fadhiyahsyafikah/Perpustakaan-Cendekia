import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { CategoryForm } from "@/components/forms";
import { updateCategory } from "@/actions/categories";

export const metadata = { title: "Ubah Kategori" };

export default async function UbahKategori({ params }) {
  await requireUser(["admin"]);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { rows } = await query("SELECT id, name, code, description FROM categories WHERE id = $1", [Number(id)]);
  if (!rows[0]) notFound();
  return (
    <div className="grid max-w-[720px] gap-5">
      <PageHeader title="Ubah Kategori" subtitle={rows[0].name} back={{ href: "/admin/kategori", label: "Kembali ke daftar kategori" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><CategoryForm action={updateCategory} item={rows[0]} /></div>
    </div>
  );
}
