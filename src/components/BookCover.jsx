"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cx } from "@/lib/styles";

// Sampul buku. Tanpa gambar (atau gambar gagal dimuat) tampil sampul pengganti: Navy, ikon buku kuning, inisial judul.
export default function BookCover({ src, title, className = "", small = false, full = false }) {
  const [broken, setBroken] = useState(false);
  const initials = String(title || "?").replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const frame = cx(
    full && src && !broken ? "w-full" : "aspect-[2/3]",
    "overflow-hidden rounded-md border",
    small ? "w-12 flex-none" : "w-full",
    className
  );

  if (!src || broken) {
    return (
      <div
        className={cx(frame, "flex flex-col items-center justify-center border-navy-800 bg-navy-800 text-yellow-500", small ? "gap-0.5" : "gap-2")}
        role="img"
        aria-label={`Sampul buku ${title}`}
      >
        <BookOpen size={small ? 18 : 34} aria-hidden="true" />
        <span className={cx("font-heading font-bold tracking-[1px] text-white", small ? "text-xs" : "text-[1.75rem]")}>{initials || "?"}</span>
      </div>
    );
  }

  return (
    <div className={cx(frame, "border-n-200 bg-n-100")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Sampul buku ${title}`}
        loading="lazy"
        onError={() => setBroken(true)}
        className={full ? "block h-auto w-full" : "block size-full object-cover"}
      />
    </div>
  );
}