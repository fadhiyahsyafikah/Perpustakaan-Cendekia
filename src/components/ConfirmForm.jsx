"use client";

import { useRef } from "react";
import { ActionForm, SubmitButton, TextAreaField } from "@/components/form";
import { btn } from "@/lib/styles";

// Tombol yang membuka dialog konfirmasi sebelum menjalankan aksi (Hapus, Reject, Pengembalian, Lunas).
// Memakai elemen <dialog>: fokus terkunci di dalam dialog dan tombol Esc menutupnya.
export default function ConfirmForm({
  action,
  fields = {},
  triggerLabel,
  triggerIcon,
  triggerVariant = "outline",
  triggerSize = "sm",
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  confirmVariant = "primary",
  confirmIcon,
  reason,
  children,
}) {
  const ref = useRef(null);
  const close = () => ref.current?.close();
  const id = `dlg-${Object.values(fields).join("-")}-t`;
  return (
    <>
      <button type="button" className={btn(triggerVariant, triggerSize)} onClick={() => ref.current?.showModal()}>
        {triggerIcon}
        <span>{triggerLabel}</span>
      </button>
      <dialog
        ref={ref}
        className="m-auto! w-[min(480px,calc(100vw-32px))] max-w-full rounded-lg border-0 p-0 text-left text-n-900 shadow-lg backdrop:bg-navy-900/50"
        aria-labelledby={id}
        onClick={(e) => e.target === ref.current && close()}
      >
        <ActionForm action={action} onSuccess={close} inlineError className="grid gap-3.5 p-6 whitespace-normal">
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <h2 id={id} className="m-0 text-xl">{title}</h2>
          {description && <p className="m-0 text-n-700">{description}</p>}
          {children}
          {reason && (
            <TextAreaField
              label={reason.label || "Alasan"}
              name={reason.name || "reason"}
              required
              minLength={5}
              maxLength={300}
              rows={3}
              hint={reason.hint}
              placeholder={reason.placeholder}
            />
          )}
          <div className="mt-1 flex flex-wrap justify-end gap-2.5 max-479px:[&>*]:basis-full">
            <button type="button" className={btn("outline")} onClick={close}>Batal</button>
            <SubmitButton variant={confirmVariant} icon={confirmIcon}>{confirmLabel}</SubmitButton>
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
