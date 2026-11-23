// Formulir CRUD yang dipakai untuk Tambah dan Ubah (server component yang merangkai komponen klien)
import Link from "next/link";
import { Save } from "lucide-react";
import { ActionForm, SubmitButton, TextField, SelectField, TextAreaField } from "@/components/form";
import CoverUploader from "@/components/CoverUploader";
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_STATUSES, ASSIGNABLE_ROLES, ROLE_LABEL } from "@/lib/config";
import { todayLocal } from "@/lib/format";
import { btn, ctl } from "@/lib/styles";

const Actions = ({ cancel, label = "Simpan" }) => (
  <div className="mt-1.5 flex flex-wrap gap-3 max-[479px]:[&>*]:basis-full">
    <SubmitButton size="lg" icon={<Save size={18} aria-hidden="true" />} pendingText="Menyimpan...">{label}</SubmitButton>
    <Link href={cancel} className={btn("outline", "lg")}>Batal</Link>
  </div>
);

export function BookForm({ action, book, categories }) {
  const edit = !!book;
  return (
    <ActionForm action={action} className="grid gap-[18px]" inlineError>
      {edit && <input type="hidden" name="id" value={book.id} />}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <div className="sm:col-span-2"><TextField label="Judul buku" name="title" required maxLength={200} defaultValue={book?.title} /></div>
        <TextField label="Pengarang / penulis" name="author" required maxLength={200} defaultValue={book?.author} />
        <TextField label="Penerbit" name="publisher" required maxLength={150} defaultValue={book?.publisher} />
        {edit ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.9375rem] font-semibold text-n-900">ISBN</span>
            <input className={ctl.input} value={book.isbn} readOnly disabled aria-describedby="isbn-note" />
            <p id="isbn-note" className="m-0 text-sm text-n-700">ISBN tidak dapat diubah.</p>
          </div>
        ) : (
          <TextField label="ISBN" name="isbn" required maxLength={20} placeholder="Contoh: 9786022916628" hint="Angka dan strip, 10 sampai 20 karakter. Harus unik." />
        )}
        <TextField label="Tahun terbit" name="publish_year" type="number" required min={1400} max={new Date().getFullYear()} defaultValue={book?.publish_year} inputMode="numeric" />
        <SelectField label="Kategori" name="category_id" required placeholder="Pilih kategori" defaultValue={book?.category_id ?? ""} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        <TextField label="Jumlah stok (total eksemplar)" name="total_stock" type="number" required min={0} defaultValue={book?.total_stock ?? 1} inputMode="numeric"
          hint={edit ? `Saat ini ${book.borrowed} eksemplar sedang dipinjam; stok total tidak boleh lebih kecil dari itu.` : "Stok tersedia awal sama dengan stok total."} />
        <TextField label="Durasi maksimal pinjam (hari)" name="max_loan_days" type="number" required min={1} max={90} defaultValue={book?.max_loan_days ?? 14} inputMode="numeric" />
        <TextField label="Tarif denda per hari (Rp)" name="fine_per_day" type="number" required min={0} step={100} defaultValue={book?.fine_per_day ?? 1000} inputMode="numeric" />
      </div>
      <CoverUploader initial={book?.cover_url || ""} title={book?.title || "Buku"} />
      <Actions cancel="/kelola/buku" label={edit ? "Simpan perubahan" : "Tambah buku"} />
    </ActionForm>
  );
}

export function AnnouncementForm({ action, item }) {
  const edit = !!item;
  const date = item?.release_date ? String(item.release_date).slice(0, 10) : todayLocal();
  return (
    <ActionForm action={action} className="grid gap-[18px]" inlineError>
      {edit && <input type="hidden" name="id" value={item.id} />}
      <TextField label="Judul pengumuman" name="title" required maxLength={160} defaultValue={item?.title} />
      <TextAreaField label="Isi pengumuman" name="content" required rows={10} defaultValue={item?.content} hint="Pisahkan paragraf dengan satu baris kosong." />
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <SelectField label="Kategori" name="category" required defaultValue={item?.category ?? "Operasional"} options={ANNOUNCEMENT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <SelectField label="Status publikasi" name="status" required defaultValue={item?.status ?? "Draft"} options={ANNOUNCEMENT_STATUSES.map((s) => ({ value: s, label: s === "Draft" ? "Draft (belum tampil di publik)" : "Published (tampil di publik)" }))} />
        <TextField label="Tanggal rilis" name="release_date" type="date" required defaultValue={date} hint="Pengumuman Published baru tampil di publik pada atau setelah tanggal ini." />
      </div>
      <Actions cancel="/kelola/pengumuman" label={edit ? "Simpan perubahan" : "Simpan pengumuman"} />
    </ActionForm>
  );
}

export function UserForm({ action, user, selfId }) {
  const edit = !!user;
  const lockAdminFields = edit && (user.role === "admin" || user.id === selfId);

  return (
    <ActionForm action={action} className="grid gap-[18px]" inlineError>
      {edit && <input type="hidden" name="id" value={user.id} />}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <TextField label="Nama lengkap" name="full_name" required maxLength={120} defaultValue={user?.full_name} />
        <TextField label="Email" name="email" type="email" required maxLength={150} defaultValue={user?.email} autoComplete="off" />
        {edit ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.9375rem] font-semibold text-n-900">Nomor identitas (NIM / NIP / NIK)</span>
            <input className={ctl.input} value={user.identity_number} readOnly disabled />
          </div>
        ) : (
          <TextField label="Nomor identitas (NIM / NIP / NIK)" name="identity_number" required maxLength={30} />
        )}

        {lockAdminFields ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.9375rem] font-semibold text-n-900">Peran</span>
            <input className={ctl.input} value={ROLE_LABEL[user.role]} readOnly disabled aria-describedby="role-note" />
            <p id="role-note" className="m-0 text-sm text-n-700">Peran akun Admin tidak dapat diubah.</p>
          </div>
        ) : (
          <SelectField
            label="Peran"
            name="role"
            required
            defaultValue={user?.role ?? "mahasiswa"}
            options={ASSIGNABLE_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
          />
        )}

        {edit ? (
          lockAdminFields ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.9375rem] font-semibold text-n-900">Status akun</span>
              <input
                className={ctl.input}
                value={user.is_active ? "Aktif" : "Nonaktif (tidak bisa masuk)"}
                readOnly
                disabled
                aria-describedby="status-note"
              />
              <p id="status-note" className="m-0 text-sm text-n-700">Status akun Admin tidak dapat diubah.</p>
            </div>
          ) : (
            <SelectField
              label="Status akun"
              name="is_active"
              defaultValue={String(user.is_active)}
              options={[
                { value: "true", label: "Aktif" },
                { value: "false", label: "Nonaktif (tidak bisa masuk)" },
              ]}
            />
          )
        ) : null}

        <TextField
          label={edit ? "Password baru (opsional)" : "Password"}
          name="password"
          type="password"
          required={!edit}
          minLength={8}
          autoComplete="new-password"
          hint="Minimal 8 karakter, berisi huruf dan angka."
          {...(edit ? { name: "new_password" } : {})}
        />
      </div>
      <Actions cancel="/admin/users" label={edit ? "Simpan perubahan" : "Buat akun"} />
    </ActionForm>
  );
}

export function CategoryForm({ action, item }) {
  const edit = !!item;
  return (
    <ActionForm action={action} className="grid gap-[18px]" inlineError>
      {edit && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <TextField label="Nama kategori (genre)" name="name" required maxLength={80} defaultValue={item?.name} placeholder="Contoh: Teknologi Informasi" />
        <TextField label="Kode klasifikasi" name="code" required maxLength={20} defaultValue={item?.code} placeholder="Contoh: TIK" hint="Huruf kapital, angka, titik, atau strip. Harus unik." />
      </div>
      <TextAreaField label="Deskripsi singkat" name="description" rows={3} maxLength={500} defaultValue={item?.description || ""} />
      <Actions cancel="/admin/kategori" label={edit ? "Simpan perubahan" : "Tambah kategori"} />
    </ActionForm>
  );
}