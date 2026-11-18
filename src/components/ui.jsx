import Link from "next/link";
import { BookOpen, CircleAlert, CircleCheck, CircleX, Clock, ClockAlert, RefreshCw, Star, Inbox } from "lucide-react";
import BookCover from "@/components/BookCover";
import { tanggalSingkat } from "@/lib/format";
import { badge, cx, stock } from "@/lib/styles";

// ---------- Badge status (selalu ikon + teks, tidak hanya warna) ----------
const TONES = {
  "Menunggu Konfirmasi": ["warning", Clock],
  "Sedang Dipinjam": ["info", BookOpen],
  "Perpanjangan Diajukan": ["warning", RefreshCw],
  Selesai: ["success", CircleCheck],
  Ditolak: ["danger", CircleX],
  Tertunggak: ["danger", CircleAlert],
  Lunas: ["success", CircleCheck],
  Terlambat: ["danger", ClockAlert],
  Disetujui: ["success", CircleCheck],
  Diajukan: ["warning", Clock],
  Published: ["success", CircleCheck],
  Draft: ["warning", Clock],
  Menunggu: ["warning", Clock],
  "Siap Diambil": ["success", CircleCheck],
  Kedaluwarsa: ["danger", CircleX],
  Dibatalkan: ["danger", CircleX],
};
export function StatusBadge({ status, label }) {
  const [tone, Icon] = TONES[status] || ["info", CircleAlert];
  return (
    <span className={badge(tone)}>
      <Icon size={14} aria-hidden="true" />
      {label || status}
    </span>
  );
}
export function Badge({ tone = "info", icon: Icon, children }) {
  return (
    <span className={badge(tone)}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  );
}

// ---------- Bintang rating ----------
export function Stars({ value, count, size = 16, showEmpty = true }) {
  if (value === null || value === undefined) {
    return showEmpty ? <span className="text-[0.8125rem] text-n-700">Belum ada ulasan</span> : null;
  }
  const r = Math.round(Number(value));
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rating ${value} dari 5${count ? `, ${count} ulasan` : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= r ? "fill-yellow-500 stroke-navy-800 stroke-[1.5]" : "fill-transparent stroke-n-300"} aria-hidden="true" />
      ))}
      <b className="ml-1 text-sm text-n-900">{Number(value).toFixed(1)}</b>
      {count !== undefined && <small className="ml-0.5 text-n-700">({count})</small>}
    </span>
  );
}

// ---------- Kartu buku ----------
export function BookCard({ book, rank }) {
  const out = book.available_stock <= 0;
  return (
    <Link
      href={`/katalog/${book.id}`}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-n-200 bg-white text-inherit no-underline shadow-sm transition hover:-translate-y-0.5 hover:no-underline hover:shadow-md"
    >
      <div className="relative px-3 pt-3">
        {rank && (
          <span
            className="absolute top-1 left-1 z-[2] grid size-[34px] place-items-center rounded-full border-2 border-white bg-yellow-500 font-heading font-bold text-navy-800 shadow-sm"
            aria-label={`Peringkat ${rank}`}
          >
            {rank}
          </span>
        )}
        <BookCover src={book.cover_url} title={book.title} />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3.5 pt-3 pb-4">
        <span className="inline-block max-w-full self-start truncate rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{book.category_name}</span>
        <h3 className="mt-1.5 mb-0 line-clamp-2 min-h-[2.6em] text-base">{book.title}</h3>
        <p className="m-0 truncate text-sm text-n-700">{book.author}</p>
        <div className="mt-auto flex flex-col items-start gap-1.5 pt-2">
          <Stars value={book.avg_rating} count={book.review_count} size={14} />
          <span className={stock(!out)}>{out ? "Habis" : `Stok ${book.available_stock}`}</span>
        </div>
        {book.loan_count !== undefined && book.loan_count > 0 && <p className="m-0 text-[0.8125rem] font-semibold text-navy-600">Dipinjam {book.loan_count} kali</p>}
      </div>
    </Link>
  );
}

// ---------- Kartu pengumuman ----------
const CAT_BORDER = { Operasional: "border-l-navy-800", Layanan: "border-l-green-500", Acara: "border-l-yellow-500" };
export function AnnouncementCard({ item }) {
  const excerpt = item.content.replace(/\s+/g, " ").slice(0, 140);
  return (
    <article className={cx("flex flex-col gap-1.5 rounded-lg border border-l-4 border-n-200 bg-white p-[18px] shadow-sm transition-shadow hover:shadow-md", CAT_BORDER[item.category] || "border-l-navy-800")}>
      <span className="inline-block max-w-full self-start rounded-sm bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">{item.category}</span>
      <h3 className="mt-1 mb-0 text-[1.0625rem]">
        <Link href={`/pengumuman/${item.id}`} className="text-navy-800 no-underline hover:underline">{item.title}</Link>
      </h3>
      <time className="text-sm text-n-700">{tanggalSingkat(item.release_date)}</time>
      <p className="mt-1 mb-0 flex-1 text-[0.9375rem] text-n-700">{excerpt}{item.content.length > 140 ? "..." : ""}</p>
      <Link href={`/pengumuman/${item.id}`} className="font-semibold underline underline-offset-[3px]">Baca selengkapnya</Link>
    </article>
  );
}

// ---------- Pagination (parameter lain dipertahankan di URL) ----------
const PG_BASE = "inline-flex h-11 min-w-11 items-center justify-center rounded-md border-[1.5px] px-3 font-semibold no-underline hover:no-underline";
const PG = cx(PG_BASE, "border-n-300 bg-white text-navy-800 hover:bg-navy-50");
const PG_ON = cx(PG_BASE, "border-navy-800 bg-navy-800 text-white");
const PG_OFF = cx(PG_BASE, "pointer-events-none border-n-300 bg-n-100 text-n-500");
export function Pagination({ page, pages, basePath, params = {} }) {
  if (pages <= 1) return null;
  const href = (p) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("halaman", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const nums = [];
  for (let p = 1; p <= pages; p++) if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
  const withGaps = [];
  nums.forEach((p, i) => {
    if (i > 0 && p - nums[i - 1] > 1) withGaps.push("...");
    withGaps.push(p);
  });
  return (
    <nav className="mt-7 flex flex-wrap items-center justify-center gap-2" aria-label="Halaman">
      {page > 1 ? <Link href={href(page - 1)} className={PG} rel="prev">Sebelumnya</Link> : <span className={PG_OFF}>Sebelumnya</span>}
      <span className="text-[0.9375rem] text-n-700 md:hidden">Halaman {page} dari {pages}</span>
      <span className="hidden items-center gap-1.5 md:inline-flex">
        {withGaps.map((p, i) =>
          p === "..." ? (
            <span key={`g${i}`} className="px-1 text-n-500">...</span>
          ) : (
            <Link key={p} href={href(p)} className={p === page ? PG_ON : PG} aria-current={p === page ? "page" : undefined}>{p}</Link>
          )
        )}
      </span>
      {page < pages ? <Link href={href(page + 1)} className={PG} rel="next">Berikutnya</Link> : <span className={PG_OFF}>Berikutnya</span>}
    </nav>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="rounded-lg border border-dashed border-n-300 bg-white px-5 py-12 text-center">
      <div className="mx-auto mb-3.5 grid size-20 place-items-center rounded-full bg-navy-50 text-navy-600"><Icon size={40} aria-hidden="true" /></div>
      <h3 className="mb-1.5">{title}</h3>
      {text && <p className="mx-auto mb-4 max-w-[44ch] text-n-700">{text}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, back }) {
  return (
    <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
      <div>
        {back && <Link href={back.href} className="mb-2 inline-block text-[0.9375rem] font-semibold">&larr; {back.label}</Link>}
        <h1 className="mb-1 md:text-[2rem]">{title}</h1>
        {subtitle && <p className="m-0 max-w-[62ch] text-n-700">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

const ALERT_TONE = {
  info: "border-navy-800 bg-navy-100 text-navy-800",
  success: "border-green-700 bg-green-100 text-green-700",
  warning: "border-yellow-600 bg-yellow-100 text-yellow-700 [&>div]:text-n-900 [&_strong]:text-yellow-700",
  danger: "border-red-600 bg-red-100 text-red-600 [&>div]:text-n-900 [&_strong]:text-red-600",
};
export function Alert({ tone = "info", icon: Icon = CircleAlert, title, children, action }) {
  return (
    <div className={cx("mb-4 flex items-start gap-3 rounded-md border-l-4 px-4 py-3.5 [&>svg]:mt-0.5 [&>svg]:shrink-0", ALERT_TONE[tone])} role={tone === "danger" || tone === "warning" ? "alert" : "status"}>
      <Icon size={22} aria-hidden="true" />
      <div className="flex-1">
        {title && <strong className="mb-0.5 block">{title}</strong>}
        <div>{children}</div>
      </div>
      {action}
    </div>
  );
}

const STAT_TONE = { navy: "bg-navy-100 text-navy-800", green: "bg-green-100 text-green-700", yellow: "bg-yellow-100 text-yellow-700", red: "bg-red-100 text-red-600" };
export function StatCard({ icon: Icon, label, value, tone = "navy", href }) {
  const inner = (
    <>
      <span className={cx("grid size-10 place-items-center rounded-full max-sm:row-span-2 sm:mb-1.5", STAT_TONE[tone])}><Icon size={22} aria-hidden="true" /></span>
      <span className="font-heading text-2xl leading-[1.1] font-bold text-navy-800 tabular-nums sm:text-[1.875rem]">{value}</span>
      <span className="text-sm text-n-700">{label}</span>
    </>
  );
  const cls = "grid grid-cols-[auto_1fr] items-center gap-x-3.5 gap-y-1 rounded-lg border border-n-200 bg-white px-4 py-3.5 text-inherit no-underline sm:grid-cols-1 sm:p-5";
  return href ? <Link href={href} className={cx(cls, "hover:shadow-md hover:no-underline")}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
