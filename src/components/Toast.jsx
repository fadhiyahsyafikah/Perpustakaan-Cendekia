"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CircleCheck, CircleAlert, X } from "lucide-react";
import { cx } from "@/lib/styles";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (message, type = "success") => {
      if (!message) return;
      const id = Date.now() + Math.random();
      setItems((list) => [...list.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), type === "error" ? 8000 : 5000);
    },
    [dismiss]
  );
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[300] flex flex-col gap-2.5 md:inset-x-auto md:top-4 md:right-4 md:bottom-auto md:w-[380px]"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={cx(
              "pointer-events-auto flex animate-toast-in items-start gap-2.5 rounded-md border border-l-[5px] border-n-200 bg-white py-3 pr-3 pl-3.5 shadow-lg",
              t.type === "error" ? "border-l-red-600 [&>svg]:text-red-600" : "border-l-green-700 [&>svg]:text-green-700"
            )}
          >
            {t.type === "error" ? <CircleAlert size={20} aria-hidden="true" /> : <CircleCheck size={20} aria-hidden="true" />}
            <p className="m-0 flex-1 text-[0.9375rem]">{t.message}</p>
            <button type="button" className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-n-700" onClick={() => dismiss(t.id)} aria-label="Tutup pesan">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
