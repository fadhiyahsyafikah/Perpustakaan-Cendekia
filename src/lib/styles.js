// Kumpulan kelas Tailwind untuk elemen yang dipakai berulang dan punya varian.
// Elemen lain memakai utility Tailwind langsung di JSX. Tema (warna, font, radius) ada di globals.css (@theme).

export const cx = (...parts) => parts.filter(Boolean).join(" ");

// Tombol
const BTN_BASE =
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border-2 px-5 font-body text-[0.9375rem] leading-[1.2] font-semibold whitespace-nowrap no-underline transition-colors duration-150 hover:no-underline active:translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-n-200 disabled:text-n-500 disabled:hover:bg-n-200";
const BTN_VARIANT = {
    primary: "border-transparent bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900",
    green: "border-transparent bg-green-500 text-navy-800 hover:bg-green-600",
    yellow: "border-transparent bg-yellow-500 text-navy-800 hover:bg-yellow-600",
    outline: "border-navy-800 bg-white text-navy-800 hover:bg-navy-50",
    ghost: "border-transparent bg-transparent text-navy-800 hover:bg-navy-50",
    danger: "border-transparent bg-red-600 text-white hover:bg-[#8f1c12]",
};
const BTN_SIZE = { sm: "px-3.5 text-sm", md: "", lg: "min-h-[52px] px-7 text-[1.0625rem]" };
export const btn = (variant = "primary", size = "md", block = false, extra = "") =>
    cx(BTN_BASE, BTN_VARIANT[variant] || BTN_VARIANT.primary, BTN_SIZE[size] ?? "", block && "w-full", extra);

// Badge status
const BADGE_BASE = "inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 text-[0.8125rem] leading-[1.3] font-semibold whitespace-nowrap";
const BADGE_TONE = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-600",
    info: "bg-navy-100 text-navy-800",
};
export const badge = (tone = "info") => cx(BADGE_BASE, BADGE_TONE[tone] || BADGE_TONE.info);

// Label stok (hijau tersedia / merah habis)
export const stock = (available) =>
    cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600");

// Kontrol formulir
const CTL_BASE =
    "min-h-12 w-full rounded-md border-[1.5px] border-n-300 bg-white px-3.5 py-2.5 font-[inherit] text-n-900 transition placeholder:text-n-500 focus:border-navy-800 focus:ring-4 focus:ring-yellow-500/55 focus:outline-none disabled:cursor-not-allowed disabled:bg-n-100 aria-invalid:border-red-600!";
    export const ctl = {
    input: CTL_BASE,
    select: CTL_BASE,
    textarea: cx(CTL_BASE, "min-h-[120px] resize-y"),
};

// Tabel (menjadi kartu pada layar < 768px)
    const TD =
    "border-t border-n-200 px-4 py-3 align-middle text-[0.9375rem] max-md:flex max-md:w-full max-md:items-center max-md:border-0 max-md:border-b max-md:border-dashed max-md:px-0 max-md:py-2.5 max-md:last:border-b-0 max-md:before:max-w-[42%] max-md:before:flex-none max-md:before:text-left max-md:before:text-xs max-md:before:font-semibold max-md:before:tracking-[0.03em] max-md:before:text-n-700 max-md:before:uppercase max-md:before:content-[attr(data-label)]";
    export const T = {
    table: "w-full border-collapse max-md:block",
    thead: "max-md:sr-only",
    tbody: "max-md:block",
    tr: "hover:bg-navy-50 max-md:mb-3 max-md:block max-md:w-full max-md:rounded-lg max-md:border max-md:border-n-200 max-md:bg-white max-md:px-3.5 max-md:py-1.5 max-md:shadow-sm max-md:hover:bg-white",
    th: "bg-navy-50 px-4 py-3 text-left text-xs font-bold tracking-[0.04em] whitespace-nowrap text-navy-800 uppercase",
    thRight: "bg-navy-50 px-4 py-3 text-right text-xs font-bold tracking-[0.04em] whitespace-nowrap text-navy-800 uppercase",
    td: cx(TD, "max-md:justify-between max-md:gap-3.5 max-md:text-right"),
    tdNum: cx(TD, "text-right tabular-nums max-md:justify-between max-md:gap-3.5 max-md:text-right"),
    tdMain: cx(TD, "max-md:justify-start max-md:text-left max-md:before:hidden!"),
    tdActions: cx(
        TD,
        "text-right whitespace-nowrap [&>:not(dialog)]:ml-1.5 [&>:not(dialog)]:align-middle max-md:flex-wrap max-md:gap-2 max-md:pt-3 max-md:before:hidden! max-md:[&>*]:basis-full max-md:[&>:not(dialog)]:ml-0 max-md:[&>a]:w-full max-md:[&>button]:w-full max-md:[&>form>button]:w-full"
    ),
};
