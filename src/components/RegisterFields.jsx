"use client";

import { useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import { FormStateOverride, SubmitButton, TextField, useFormState } from "@/components/form";
import { cx } from "@/lib/styles";
import { UserPlus } from "lucide-react";

const TYPES = {
  mahasiswa: {
    title: "Mahasiswa",
    note: "Memakai email kampus",
    icon: GraduationCap,
    idLabel: "NIM",
    idPlaceholder: "Contoh: 2024001",
    idHint: "Nomor Induk Mahasiswa sesuai kartu mahasiswa.",
    emailLabel: "Email kampus",
    emailPlaceholder: "nama@kampus.ac.id",
  },
  umum: {
    title: "Pengunjung Umum",
    note: "Dosen, alumni, atau masyarakat umum",
    icon: Users,
    idLabel: "Nomor identitas (NIK / KTP)",
    idPlaceholder: "Contoh: 7371xxxxxxxxxxxx",
    idHint: "NIK pada KTP atau nomor identitas resmi lainnya. Dipakai untuk mengenali Anda di meja sirkulasi.",
    emailLabel: "Email",
    emailPlaceholder: "nama@email.com",
  },
};

// Isi formulir pendaftaran: pilihan jenis akun mengubah label dan petunjuk kolom di bawahnya
export default function RegisterFields({ domain = "ac.id" }) {
  const { values, errors } = useFormState();
  const [type, setType] = useState(values.account_type === "umum" ? "umum" : "mahasiswa");
  const t = TYPES[type];
  // Galat dari server hanya relevan untuk jenis akun yang dikirim; sembunyikan saat pengguna berganti jenis
  const submittedType = values.account_type === "umum" ? "umum" : "mahasiswa";
  const fieldErrors = submittedType === type ? errors : { ...errors, email: undefined, identity_number: undefined };
  return (
    <FormStateOverride errors={fieldErrors} values={values}>
      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="mb-1.5 text-[0.9375rem] font-semibold text-n-900">Daftar sebagai</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Object.entries(TYPES).map(([key, o]) => {
            const Icon = o.icon;
            const on = type === key;
            return (
              <label
                key={key}
                className={cx(
                  "flex min-h-[72px] cursor-pointer items-start gap-3 rounded-md border-2 p-3 transition focus-within:shadow-[0_0_0_2px_var(--color-navy-800),0_0_0_5px_var(--color-yellow-500)]",
                  on ? "border-navy-800 bg-navy-50" : "border-n-300 bg-white hover:bg-navy-50"
                )}
              >
                <input type="radio" name="account_type" value={key} checked={on} onChange={() => setType(key)} className="sr-only" />
                <span className={cx("grid size-9 flex-none place-items-center rounded-full", on ? "bg-navy-800 text-white" : "bg-navy-100 text-navy-800")}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="grid gap-0.5 leading-tight">
                  <b className="text-[0.9375rem] text-navy-800">{o.title}</b>
                  <small className="text-[0.8125rem] text-n-700">{o.note}</small>
                </span>
              </label>
            );
          })}
        </div>
        {errors.account_type && <p className="m-0 text-sm font-medium text-red-600" role="alert">{errors.account_type}</p>}
      </fieldset>

      <TextField label="Nama lengkap" name="full_name" required autoComplete="name" maxLength={120} placeholder="Contoh: Andi Pratama" />
      <TextField label={t.idLabel} name="identity_number" required maxLength={30} placeholder={t.idPlaceholder} hint={t.idHint} />
      <TextField
        label={t.emailLabel}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={t.emailPlaceholder}
        hint={type === "mahasiswa" ? `Wajib berakhiran email kampus, misalnya nama@kampus.${domain}.` : "Boleh memakai Gmail, Yahoo, atau email lain yang aktif."}
      />
      <TextField label="Password" name="password" type="password" required minLength={8} autoComplete="new-password" hint="Minimal 8 karakter, berisi huruf dan angka." />
      <TextField label="Ulangi password" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" />
      <SubmitButton size="lg" block icon={<UserPlus size={18} aria-hidden="true" />} pendingText="Mendaftarkan...">Daftar</SubmitButton>
    </FormStateOverride>
  );
}
