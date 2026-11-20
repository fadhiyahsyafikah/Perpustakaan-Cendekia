import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { UserForm } from "@/components/forms";
import { createUser } from "@/actions/users";

export const metadata = { title: "Tambah Pengguna" };

export default async function UserBaru() {
  await requireUser(["admin"]);
  return (
    <div className="grid max-w-[780px] gap-5">
      <PageHeader title="Tambah Pengguna" back={{ href: "/admin/users", label: "Kembali ke daftar pengguna" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><UserForm action={createUser} /></div>
    </div>
  );
}
