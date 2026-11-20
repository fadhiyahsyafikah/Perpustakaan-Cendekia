import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = {
  title: { default: "Perpustakaan Cendekia", template: "%s | Perpustakaan Cendekia" },
  description: "Sistem manajemen perpustakaan kampus: cari buku, ajukan peminjaman, dan pantau denda secara daring.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0A1172" };

// Terapkan ukuran huruf pilihan pengguna sebelum halaman tampil (mencegah kedipan)
const fsScript = `try{var f=localStorage.getItem('cendekia-fs');if(f)document.documentElement.dataset.fs=f}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fsScript }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
