import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listUsers } from "@/lib/data/users";
import { PageHeader, EmptyState, Pagination, Badge } from "@/components/ui";
import ConfirmForm from "@/components/ConfirmForm";
import { deleteUser } from "@/actions/users";
import { ROLES, ROLE_LABEL } from "@/lib/config";
import { str } from "@/lib/format";
import { T, btn, ctl } from "@/lib/styles";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Manajemen Pengguna" };

export default async function UsersPage({ searchParams }) {
  const me = await requireUser(["admin"]);
  const sp = await searchParams;
  const role = ROLES.includes(str(sp.role)) ? str(sp.role) : "";
  const q = str(sp.q).trim();
  const data = await listUsers({ role, q, halaman: str(sp.halaman) });
  return (
    <div className="grid gap-5">
      <PageHeader title="Manajemen Pengguna" subtitle={`${data.total} akun. Akun yang pernah bertransaksi hanya dapat dinonaktifkan, tidak dihapus.`} actions={<Link href="/admin/users/baru" className={btn("primary")}><Plus size={18} aria-hidden="true" /> Tambah pengguna</Link>} />
      <form action="/admin/users" method="get" role="search" className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-[0.9375rem] font-semibold text-n-900">Cari nama, email, atau NIM/NIP/ID</label>
          <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]"><Search size={20} aria-hidden="true" /><input id="q" name="q" type="search" className={ctl.input} defaultValue={q} /></div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-[0.9375rem] font-semibold text-n-900">Peran</label>
          <select id="role" name="role" className={ctl.select} defaultValue={role}><option value="">Semua peran</option>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
        </div>
        <button className={btn("primary")} type="submit">Terapkan</button>
      </form>
      {data.items.length ? (
        <div className="overflow-hidden rounded-lg border border-n-200 bg-white max-md:overflow-visible max-md:border-0 max-md:bg-transparent">
          <table className={T.table}>
            <thead className={T.thead}><tr className={T.tr}><th className={T.th}>Nama</th><th className={T.th}>Email</th><th className={T.th}>NIM / NIP / ID</th><th className={T.th}>Peran</th><th className={T.th}>Status</th><th className={T.thRight}>Aksi</th></tr></thead>
            <tbody className={T.tbody}>
              {data.items.map((u) => (
                <tr key={u.id} className={T.tr}>
                  <td  data-label="Nama" className={T.tdMain}><b>{u.full_name}</b>{u.id === me.id && <> <Badge tone="info">Anda</Badge></>}</td>
                  <td data-label="Email" className={T.td}>{u.email}</td>
                  <td data-label="NIM / NIP / ID" className={T.td}>{u.identity_number}</td>
                  <td data-label="Peran" className={T.td}><span className="inline-block max-w-full rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{ROLE_LABEL[u.role]}</span></td>
                  <td data-label="Status" className={T.td}>{u.is_active ? <Badge tone="success">Aktif</Badge> : <Badge tone="danger">Nonaktif</Badge>}</td>
                  <td  data-label="Aksi" className={T.tdActions}>
                    <Link href={`/admin/users/${u.id}`} className={btn("outline", "sm")}><Pencil size={16} aria-hidden="true" /> Ubah</Link>
                    {u.id !== me.id && (
                      <ConfirmForm action={deleteUser} fields={{ id: u.id }} triggerLabel="Hapus" triggerIcon={<Trash2 size={18} aria-hidden="true" />} triggerVariant="danger" title="Hapus akun ini?"
                        description={u.loan_count > 0 ? `${u.full_name} pernah bertransaksi sehingga akun tidak dapat dihapus. Gunakan menu Ubah untuk menonaktifkan.` : `Hapus akun ${u.full_name}? Tindakan ini tidak dapat dibatalkan.`}
                        confirmLabel="Ya, hapus" confirmVariant="danger" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Users} title="Pengguna tidak ditemukan" text="Coba kata kunci lain atau ubah filter peran." />
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/admin/users" params={{ q, role }} />
    </div>
  );
}
