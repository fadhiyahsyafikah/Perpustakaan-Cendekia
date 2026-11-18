"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/styles";

// Pengatur ukuran huruf (ramah untuk semua usia). Pilihan disimpan di peramban.
export default function FontSize({ className = "" }) {
  const [size, setSize] = useState("md");
  useEffect(() => {
    try {
      setSize(localStorage.getItem("cendekia-fs") || "md");
    } catch {}
  }, []);
  function pick(v) {
    setSize(v);
    document.documentElement.dataset.fs = v;
    try {
      localStorage.setItem("cendekia-fs", v);
    } catch {}
  }
  return (
    <div className={cx("inline-flex overflow-hidden rounded-md border-[1.5px] border-n-300", className)} role="group" aria-label="Ukuran huruf">
      {[
        ["md", "Huruf normal", "text-[13px]"],
        ["lg", "Huruf besar", "text-base"],
        ["xl", "Huruf sangat besar", "text-[19px]"],
      ].map(([v, label, textSize], i) => (
        <button
          key={v}
          type="button"
          onClick={() => pick(v)}
          aria-pressed={size === v}
          aria-label={label}
          title={label}
          className={cx(
            "h-10 min-w-[38px] cursor-pointer border-0 font-heading font-bold", textSize,
            i > 0 && "border-l-[1.5px] border-n-300",
            size === v ? "bg-navy-800 text-white" : "bg-white text-navy-800"
          )}
        >
          A
        </button>
      ))}
    </div>
  );
}
