"use client";

import { createContext, useActionState, useCallback, useContext, useId, useMemo, useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { CircleAlert, Eye, EyeOff, LoaderCircle, Star } from "lucide-react";
import { useToast } from "@/components/Toast";
import { btn, cx, ctl } from "@/lib/styles";

const FormCtx = createContext({ errors: {}, values: {} });
// Dipakai komponen anak di dalam <ActionForm> yang perlu membaca isian terakhir / galat server
export const useFormState = () => useContext(FormCtx);
// Menimpa galat/isian untuk komponen anak (mis. menyembunyikan galat yang sudah tidak relevan)
export function FormStateOverride({ errors, values, children }) {
  return <FormCtx.Provider value={{ errors, values }}>{children}</FormCtx.Provider>;
}

// Pembungkus formulir: menjalankan Server Action, menampilkan toast / pesan galat per kolom,
// dan mempertahankan isian saat validasi server gagal ("input tidak hilang").
export function ActionForm({ action, children, className, onSuccess, inlineError = false, ...rest }) {
  const router = useRouter();
  const toast = useToast();
  // Simpan referensi terbaru agar pembungkus di bawah tetap stabil
  const latest = useRef({});
  
  // PERBAIKAN: Perbarui nilai ref di dalam useEffect, bukan langsung saat render
  useEffect(() => {
    latest.current = { action, onSuccess, inlineError, router, toast };
  });

  // Notifikasi dan pengalihan ditangani LANGSUNG saat respons aksi tiba, sebelum halaman
  // dirender ulang. Dengan begitu pesan tetap tampil walau formulirnya hilang setelah data berubah
  // (contoh: baris antrean yang sudah disetujui, atau tombol "Ajukan Pinjam" yang berganti).
  const wrapped = useCallback(async (prev, formData) => {
    const { action, onSuccess, inlineError, router, toast } = latest.current;
    const res = await action(prev, formData);
    if (res && !res.silent) {
      if (res.ok) {
        toast(res.message, "success");
        onSuccess?.();
        if (res.redirectTo) router.push(res.redirectTo);
      } else if (!inlineError) {
        toast(res.message, "error");
      }
    }
    return res;
  }, []);
  const [state, formAction] = useActionState(wrapped, null);

  const ctx = useMemo(() => ({ errors: state?.errors || {}, values: state?.values || {} }), [state]);
  return (
    <FormCtx.Provider value={ctx}>
      <form action={formAction} className={className} {...rest}>
        {inlineError && state && !state.ok && state.message && (
          <div role="alert" className="mb-4 flex items-start gap-3 rounded-md border-l-4 px-4 py-3.5 [&>svg]:mt-0.5 [&>svg]:shrink-0 border-red-600 bg-red-100 text-red-600 [&>div]:text-n-900 [&_strong]:text-red-600">
            <CircleAlert size={20} aria-hidden="true" />
            <div>{state.message}</div>
          </div>
        )}
        {children}
      </form>
    </FormCtx.Provider>
  );
}

export function SubmitButton({ children, variant = "primary", size, icon, pendingText = "Memproses...", className = "", block = false, disabled = false }) {
  const { pending } = useFormStatus();
  const cls = btn(variant, size || "md", block, className);
  return (
    <button type="submit" className={cls} disabled={pending || disabled} aria-busy={pending}>
      {pending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : icon || null}
      <span>{pending ? pendingText : children}</span>
    </button>
  );
}

// Tombol aksi langsung tanpa dialog (contoh: Approve)
export function ActionButton({ action, fields = {}, children, ...btn }) {
  return (
    <ActionForm action={action} className="inline-block">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton {...btn}>{children}</SubmitButton>
    </ActionForm>
  );
}

function FieldShell({ id, label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.9375rem] font-semibold text-n-900">
        {label}
        {required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-sm text-n-700">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="m-0 flex items-start gap-1.5 text-sm font-medium text-red-600 [&_svg]:mt-0.5 [&_svg]:shrink-0" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const describe = (id, hint, error) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export function TextField({ label, name, type = "text", defaultValue = "", hint, required, ...props }) {
  const { errors, values } = useContext(FormCtx);
  const id = useId();
  const [show, setShow] = useState(false);
  const error = errors[name];
  const isPw = type === "password";
  const value = isPw ? undefined : values[name] ?? defaultValue;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <div className={isPw ? "relative" : undefined}>
        <input
          id={id}
          name={name}
          type={isPw && show ? "text" : type}
          className={cx(ctl.input, isPw && "pr-[52px]")}
          defaultValue={value}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describe(id, hint, error)}
          {...props}
        />
        {isPw && (
          <button type="button" className="absolute top-0.5 right-0.5 grid size-11 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-n-700" onClick={() => setShow((s) => !s)} aria-label={show ? "Sembunyikan password" : "Tampilkan password"}>
            {show ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        )}
      </div>
    </FieldShell>
  );
}

export function SelectField({ label, name, options, defaultValue = "", hint, required, placeholder, ...props }) {
  const { errors, values } = useContext(FormCtx);
  const id = useId();
  const error = errors[name];
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <select
        key={String(values[name] ?? "init")}
        id={id}
        name={name}
        className={ctl.select}
        defaultValue={values[name] ?? defaultValue}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describe(id, hint, error)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({ label, name, defaultValue = "", hint, required, maxLength, rows = 4, ...props }) {
  const { errors, values } = useContext(FormCtx);
  const id = useId();
  const error = errors[name];
  const initial = values[name] ?? defaultValue;
  const [len, setLen] = useState(String(initial).length);
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <textarea
        key={String(values[name] ?? "init")}
        id={id}
        name={name}
        rows={rows}
        className={ctl.textarea}
        defaultValue={initial}
        required={required}
        maxLength={maxLength ? maxLength + 200 : undefined}
        onInput={(e) => setLen(e.target.value.length)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describe(id, hint, error)}
        {...props}
      />
      {maxLength && (
        <p className={cx("m-0 text-right text-[0.8125rem]", len > maxLength ? "font-semibold text-red-600" : "text-n-700")} aria-live="polite">
          {len} / {maxLength} karakter
        </p>
      )}
    </FieldShell>
  );
}

// Pemilih rating 1 sampai 5 (grup radio, dapat dioperasikan dengan panah keyboard)
export function StarInput({ name = "rating", defaultValue = 0 }) {
  const { errors, values } = useContext(FormCtx);
  const [val, setVal] = useState(Number(values[name] ?? defaultValue) || 0);
  const [hover, setHover] = useState(0);
  const labels = ["", "Sangat kurang", "Kurang", "Cukup", "Bagus", "Sangat bagus"];
  const shown = hover || val;
  const error = errors[name];
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.9375rem] font-semibold text-n-900" id="rating-label">Rating Anda <span className="text-red-600" aria-hidden="true">*</span></span>
      <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-labelledby="rating-label" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            onMouseEnter={() => setHover(n)}
            className={cx(
              "inline-flex cursor-pointer rounded-sm p-0.5 transition-transform hover:[&_svg]:scale-110 focus-within:shadow-[0_0_0_2px_var(--color-navy-800),0_0_0_5px_var(--color-yellow-500)]",
              n <= shown ? "[&_svg]:fill-yellow-500 [&_svg]:stroke-navy-800" : "[&_svg]:fill-transparent [&_svg]:stroke-n-300"
            )}
          >
            <input type="radio" name={name} value={n} checked={val === n} onChange={() => setVal(n)} required className="sr-only" />
            <Star size={36} aria-hidden="true" />
            <span className="sr-only">{n} bintang</span>
          </label>
        ))}
        <span className="ml-2.5 text-[0.9375rem] font-semibold text-navy-800" aria-live="polite">{shown ? `${shown} dari 5: ${labels[shown]}` : "Pilih bintang"}</span>
      </div>
      {error && (
        <p className="m-0 flex items-start gap-1.5 text-sm font-medium text-red-600 [&_svg]:mt-0.5 [&_svg]:shrink-0" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}