// Logotype: buku terbuka biru tua dengan tunas hijau (ilmu yang tumbuh) + wordmark Poppins Bold
import { cx } from "@/lib/styles";

export function LogoMark({ size = 36, light = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Logo Perpustakaan Cendekia">
      <path d="M4 12c7-3 14-2 20 3v26c-6-5-13-6-20-3V12z" fill={light ? "#ffffff" : "#0A1172"} />
      <path d="M44 12c-7-3-14-2-20 3v26c6-5 13-6 20-3V12z" fill={light ? "#c9ccf3" : "#1A25A0"} />
      <path d="M24 15v-3" stroke="#6BD667" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 12c0-5 4-8 9-8 0 5-3 8-9 8z" fill="#6BD667" />
      <path d="M24 13c0-4-3-6-7-6 0 4 2 6 7 6z" fill="#55C451" />
    </svg>
  );
}

export default function Logo({ size = 36, light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} light={light} />
      <span className={cx("font-heading text-[0.95rem] leading-[1.1] font-bold min-[421px]:text-lg", light ? "text-white" : "text-navy-800")}>
        Perpustakaan{" "}
        <span className="underline decoration-yellow-500 decoration-[3px] underline-offset-4">Cendekia</span>
      </span>
    </span>
  );
}
