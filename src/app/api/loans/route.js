import { NextResponse } from "next/server";
import { authorize } from "@/lib/session";
import { searchLoans } from "@/lib/data/loans";
import { LOAN_STATUS } from "@/lib/config";

// GET /api/loans?status=&from=&to=&q=&halaman=  (Admin, Pegawai)
export async function GET(request) {
    const auth = await authorize(["admin", "pegawai"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });
    try {
        const sp = request.nextUrl.searchParams;
        const status = Object.values(LOAN_STATUS).includes(sp.get("status")) ? sp.get("status") : undefined;
        const data = await searchLoans({ status, from: sp.get("from") || "", to: sp.get("to") || "", q: sp.get("q") || "", halaman: sp.get("halaman") });
        return NextResponse.json(data);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Gagal mengambil data transaksi." }, { status: 500 });
    }
}
