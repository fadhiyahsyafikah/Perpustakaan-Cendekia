import { NextResponse } from "next/server";
import { authorize } from "@/lib/session";
import { reportRows } from "@/lib/data/loans";
import { LOAN_STATUS } from "@/lib/config";

const esc = (v) => {
    if (v === null || v === undefined) return "";
    let s = v instanceof Date ? v.toISOString() : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // cegah CSV injection saat dibuka di Excel
    return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

// GET /api/reports/loans.csv?type=transaksi|denda&from=&to=&status=   (Admin, opsional)
export async function GET(request) {
    const auth = await authorize(["admin"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });
    const sp = request.nextUrl.searchParams;
    const type = sp.get("type") === "denda" ? "denda" : "transaksi";
    const from = sp.get("from") || "";
    const to = sp.get("to") || "";
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if ((from && !re.test(from)) || (to && !re.test(to)) || (from && to && from > to)) {
        return NextResponse.json({ message: "Rentang tanggal tidak valid." }, { status: 400 });
    }
    const st = sp.get("status") || "";
    const allowed = type === "denda" ? ["Tertunggak", "Lunas"] : Object.values(LOAN_STATUS);
    const status = allowed.includes(st) ? st : undefined;
    try {
        const rows = await reportRows({ type, from, to, status });
        const cols = rows.length ? Object.keys(rows[0]) : [];
        const csv = "\uFEFF" + [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\r\n");
        return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="laporan-${type}.csv"`,
        },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Gagal membuat laporan." }, { status: 500 });
    }
}
