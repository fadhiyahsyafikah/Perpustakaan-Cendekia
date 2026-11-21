"use client";

import { useState } from "react";
import { GraduationCap, UserPlus, Users } from "lucide-react";
import { FormStateOverride, SubmitButton, TextField, useFormState } from "@/components/form";
import { cx } from "@/lib/styles";

const TYPES = {
  mahasiswa: {
    title: "Mahasiswa",
    icon: GraduationCap,
    idLabel: "NIM",
    idPlaceholder: "Contoh: 2024001",
    emailLabel: "Email kampus",
  },
  umum: {
    title: "Pengunjung Umum",
    icon: Users,
    idLabel: "NIK / No. Identitas",
    idPlaceholder: "Contoh: 7371xxxxxxxxxxxx",
    emailLabel: "Email",
  },
};

// Isi formulir pendaftaran: pilihan jenis akun mengubah label dan placeholder kolom
export default function RegisterFields({ domain = "ac.id" }) {
  const { values, errors } = useFormState();
  const [type, setType] = useState(values.account_type === "umum" ? "umum" : "mahasiswa");
  const t = TYPES[type];

  // Galat dari server hanya relevan untuk jenis akun yang dikirim; sembunyikan saat pengguna berganti jenis
  const submittedType = values.account_type === "umum" ? "umum" : "mahasiswa";
  const fieldErrors = submittedType === type ? errors : { ...errors, email: undefined, identity_number: undefined };

  return (
    <FormStateOverride errors={fieldErrors} values={values}>
      <fieldset className="m-0 grid gap-1.5 border-0 p-0">
        <legend className="sr-only">Daftar sebagai</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-n-100 p-1">
          {Object.entries(TYPES).map(([key, o]) => {
            const Icon = o.icon;
            const on = type === key;
            return (
              <label
                key={key}
                className={cx(
                  "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition focus-within:shadow-[0_0_0_2px_var(--color-navy-800),0_0_0_5px_var(--color-yellow-500)] sm:text-sm",
                  on ? "bg-white text-navy-800 shadow-sm" : "text-n-700 hover:text-navy-800"
                )}
              >
                <input
                  type="radio"
                  name="account_type"
                  value={key}
                  checked={on}
                  onChange={() => setType(key)}
                  className="sr-only"
                />
                <Icon size={16} aria-hidden="true" />
                <span>{o.title}</span>
              </label>
            );
          })}
        </div>
        {errors.account_type && (
          <p className="m-0 text-xs font-medium text-red-600" role="alert">
            {errors.account_type}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Nama lengkap"
          name="full_name"
          required
          autoComplete="name"
          maxLength={120}
          placeholder="Contoh: Andi Pratama"
        />
        <TextField
          label={t.idLabel}
          name="identity_number"
          required
          maxLength={30}
          placeholder={t.idPlaceholder}
        />
      </div>

      <TextField
        label={t.emailLabel}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={type === "mahasiswa" ? `nama@kampus.${domain}` : "nama@email.com"}
      />

      <div className="grid gap-1.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          <TextField
            label="Ulangi password"
            name="password_confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>
        <p className="m-0 text-xs text-n-500">
          Min. 8 karakter (kombinasi huruf &amp; angka).
        </p>
      </div>

      <div className="mt-1">
        <SubmitButton size="md" block icon={<UserPlus size={17} aria-hidden="true" />} pendingText="Mendaftarkan...">
          Daftar
        </SubmitButton>
      </div>
    </FormStateOverride>
  );
}