import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Lapis pertama otorisasi (per rute). Lapis kedua ada di tiap halaman, Server Action, dan Route Handler.
const RULES = [
    { prefix: "/pengunjung", roles: ["mahasiswa", "umum"] }, // dashboard anggota (Mahasiswa dan Pengunjung Umum)
    { prefix: "/pegawai", roles: ["pegawai"] },
    { prefix: "/kelola", roles: ["pegawai", "admin"] },
    { prefix: "/admin", roles: ["admin"] },
    { prefix: "/api/loans", roles: ["pegawai", "admin"], api: true },
    { prefix: "/api/upload", roles: ["pegawai", "admin"], api: true },
    { prefix: "/api/reports", roles: ["admin"], api: true },  
];

export async function proxy(req) {
    const { pathname } = req.nextUrl;
    const rule = RULES.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
    if (!rule) return NextResponse.next();

    let role = null;
    try {
        const token = req.cookies.get("cendekia_session")?.value;
        if (token) {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET || ""));
        role = payload.role;
        }
    } catch {}

    if (!role) {
        if (rule.api) return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
        const url = new URL("/login", req.url);
        url.searchParams.set("next", pathname + req.nextUrl.search);
        return NextResponse.redirect(url);
    }
    if (!rule.roles.includes(role)) {
        if (rule.api) return NextResponse.json({ message: "Anda tidak memiliki hak akses." }, { status: 403 });
        return NextResponse.rewrite(new URL("/403", req.url), { status: 403 });
    }
    return NextResponse.next();
    }

export const config = {
    matcher: ["/pengunjung/:path*", "/pegawai/:path*", "/kelola/:path*", "/admin/:path*", "/api/loans/:path*", "/api/upload/:path*", "/api/reports/:path*"],
};
