import { CONFIG } from "@/lib/config";

export const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(Number(n) || 0);

// Tanggal murni "YYYY-MM-DD" -> "15 November 2026"
export function tanggal(value) {
    if (!value) return "-";
    const s = typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
    const d = new Date(s + "T00:00:00Z");
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export function tanggalSingkat(value) {
    if (!value) return "-";
    const s = typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
        new Date(s + "T00:00:00Z")
    );
}

// Waktu (timestamptz); tanggal dan jamanya
export function waktu(value) {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    const txt = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: CONFIG.TIMEZONE,
    }).format(d);
    return txt + " WITA";
}

export function todayLocal() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.TIMEZONE }).format(new Date());
}

export function inisial(text = "") {
    const w = String(text).replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).filter(Boolean);
    if (!w.length) return "?";
    return (w[0][0] + (w[1]?.[0] || "")).toUpperCase();
}

export function sisaHariLabel(days) {
    if (days === null || days === undefined) return "";
    if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
    if (days === 0) return "Jatuh tempo hari ini";
    if (days === 1) return "Besok jatuh tempo";
    return `${days} hari lagi`;
}

export const pageParam = (v) => Math.max(1, parseInt(Array.isArray(v) ? v[0] : v, 10) || 1);
export const str = (v) => (Array.isArray(v) ? v[0] : v) ?? "";
