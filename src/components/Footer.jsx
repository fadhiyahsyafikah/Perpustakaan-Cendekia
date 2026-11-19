import Link from "next/link";
import { Clock, MapPin, Mail } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 pt-10 text-navy-100 [&_h2]:mb-2.5 [&_h2]:text-base [&_h2]:text-white [&_p]:mb-2 [&_p]:flex [&_p]:items-start [&_p]:gap-2 [&_p]:text-[0.9375rem] [&_p_svg]:mt-1 [&_p_svg]:shrink-0 [&_a]:text-white">
      <div className="mx-auto w-full max-w-1200px px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-7 pb-7 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-3! font-semibold text-yellow-500">Ilmu Terhimpun, Cendekia Berkembang.</p>
        </div>
        <div>
          <h2>Jam layanan</h2>
          <p><Clock size={16} aria-hidden="true" /> Senin sampai Jumat, 08.00 sampai 17.00 WITA</p>
          <p><Clock size={16} aria-hidden="true" /> Sabtu, 09.00 sampai 14.00 WITA</p>
        </div>
        <div>
          <h2>Kontak</h2>
          <p><MapPin size={16} aria-hidden="true" /> Meja sirkulasi, Gedung Perpustakaan</p>
          <p><Mail size={16} aria-hidden="true" /> layanan@cendekia.ac.id</p>
        </div>
        <div>
          <h2>Tautan cepat</h2>
          <p><Link href="/katalog">Katalog buku</Link></p>
          <p><Link href="/pengumuman">Pengumuman</Link></p>
        </div>
      </div>
      <p className="m-0! justify-center border-t border-white/15 p-4 text-center text-sm!">&copy; {new Date().getFullYear()} Perpustakaan Cendekia</p>
    </footer>
  );
}
