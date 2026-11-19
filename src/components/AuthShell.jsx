import Link from "next/link";
import { BookOpenCheck, Search, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";

export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,var(--color-navy-800),var(--color-navy-900))] p-14 text-white lg:flex after:absolute after:-right-100px after:-bottom-100px after:size-360px after:rounded-full after:bg-[radial-gradient(circle,rgba(107,214,103,0.3),transparent_70%)] after:content-[''] [&_h2]:text-4xl [&_h2]:leading-[1.2] [&_h2]:text-white [&_h2_em]:text-yellow-500 [&_h2_em]:not-italic [&_ul]:relative [&_ul]:z-[1] [&_ul]:mt-6 [&_ul]:grid [&_ul]:gap-3.5 [&_ul]:p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_li]:text-navy-100 [&_li_svg]:shrink-0 [&_li_svg]:text-green-500" aria-hidden="false">
        <Logo light size={40} />
        <div>
          <h2>Ilmu terhimpun, <em>cendekia berkembang.</em></h2>
          <p className="max-w-[40ch] text-[#c9ccf3]">Satu tempat untuk mencari buku, meminjam, dan memantau denda dengan jelas.</p>
          <ul>
            <li><Search size={22} aria-hidden="true" /> Cari ribuan judul dengan cepat</li>
            <li><BookOpenCheck size={22} aria-hidden="true" /> Ajukan pinjam dan perpanjangan secara daring</li>
            <li><ShieldCheck size={22} aria-hidden="true" /> Status pinjaman dan denda selalu jelas</li>
          </ul>
        </div>
        <p className="relative z-[1] m-0 text-sm text-[#c9ccf3]">&copy; {new Date().getFullYear()} Perpustakaan Cendekia</p>
      </aside>
      <main className="flex items-center justify-center bg-white px-4 py-6" id="konten">
        <div className="w-full max-w-440px [&_h1]:text-[1.75rem]">
          <Link href="/" className="mb-6 block no-underline" aria-label="Ke Beranda"><Logo /></Link>
          {children}
        </div>
      </main>
    </div>
  );
}
