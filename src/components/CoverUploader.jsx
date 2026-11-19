"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, LoaderCircle } from "lucide-react";
import BookCover from "@/components/BookCover";
import { btn, ctl } from "@/lib/styles";

// Unggah sampul (JPG/PNG/WebP, maks 2 MB) lewat POST /api/upload/cover, atau tempel tautan gambar.
export default function CoverUploader({ initial = "", title = "Buku" }) {
  const [url, setUrl] = useState(initial || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef(null);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setErr("Format gambar harus JPG, PNG, atau WebP.");
    if (file.size > 2 * 1024 * 1024) return setErr("Ukuran gambar maksimal 2 MB.");
    setBusy(true);
    try {
        const res = await fetch("/api/upload/cover", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) setErr(data.message || "Gagal mengunggah gambar.");
      else setUrl(data.url);
    } catch {
      setErr("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.9375rem] font-semibold text-n-900">Sampul buku <small>(opsional)</small></span>
      <div className="grid grid-cols-1 gap-4 rounded-lg border-2 border-dashed border-n-300 p-4 sm:grid-cols-[160px_1fr]">
        <div className="w-full max-w-40">
          <BookCover key={url} src={url} title={title} />
        </div>
        <div className="grid content-start gap-2.5 [&>label]:cursor-pointer [&>label]:justify-self-start [&>button]:justify-self-start">
          <input type="hidden" name="cover_url" value={url} />
          <input ref={input} id="cover-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="sr-only" />
          <label htmlFor="cover-file" className={btn("outline", "sm")}>
            {busy ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={18} aria-hidden="true" />}
            {busy ? "Mengunggah..." : url ? "Ganti gambar" : "Pilih gambar"}
          </label>
          {url && (
            <button type="button" className={btn("ghost", "sm")} onClick={() => setUrl("")}>
              <Trash2 size={18} aria-hidden="true" /> Hapus sampul
            </button>
          )}
          <label className="text-[0.9375rem] font-semibold text-n-900" htmlFor="cover-url-text">Atau tempel tautan gambar</label>
          <input id="cover-url-text" type="url" className={ctl.input} placeholder="https://..." value={url.startsWith("/api/covers/") ? "" : url} onChange={(e) => setUrl(e.target.value)} />
          <p className="m-0 text-sm text-n-700">JPG, PNG, atau WebP, maksimal 2 MB, rasio 3:4. Tanpa sampul, katalog memakai sampul pengganti.</p>
          {err && <p className="m-0 flex items-start gap-1.5 text-sm font-medium text-red-600 [&_svg]:mt-0.5 [&_svg]:shrink-0" role="alert">{err}</p>}
        </div>
      </div>
    </div>
  );
}
