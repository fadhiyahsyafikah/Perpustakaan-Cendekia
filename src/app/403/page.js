import Link from "next/link";
import { btn } from "@/lib/styles";

export const metadata = { title: "Akses ditolak" };

export default function Forbidden() {
    return (
        <main className="grid min-h-[70vh] place-items-center px-4 py-10 text-center [&_p]:mx-auto [&_p]:mt-2 [&_p]:mb-5 [&_p]:max-w-[44ch] [&_p]:text-n-700">
        <div>
            <div className="font-heading text-[5rem] leading-none font-bold text-navy-800">403</div>
            <h1>Akses ditolak</h1>
            <p>Anda tidak memiliki hak akses ke halaman ini. Jika Anda merasa ini keliru, silakan masuk dengan akun yang sesuai.</p>
            <Link href="/" className={btn("primary", "lg")}>Kembali ke Beranda</Link>
        </div>
        </main>
    );
}
