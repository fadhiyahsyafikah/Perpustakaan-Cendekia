import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getUser } from "@/lib/data/users";
import { PageHeader } from "@/components/ui";
import { UserForm } from "@/components/forms";
import { updateUser } from "@/actions/users";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Ubah Pengguna" };

export default async function UbahUser({ params }) {
  const me = await requireUser(["admin"]);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const user = await getUser(Number(id));
  if (!user) notFound();
  return (
    <div className="grid max-w-[780px] gap-5">
      <PageHeader title="Ubah Pengguna" subtitle={user.full_name} back={{ href: "/admin/users", label: "Kembali ke daftar pengguna" }} />
      <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6"><UserForm action={updateUser} user={user} selfId={me.id} /></div>
    </div>
  );
}
