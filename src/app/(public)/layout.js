import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/session";

export default async function PublicLayout({ children }) {
  const user = await getCurrentUser();

  if (user?.role === "admin") redirect("/admin/dashboard");
  if (user?.role === "pegawai") redirect("/pegawai/dashboard");

  return (
    <>
      <a href="#konten" className="absolute left-2 -top-16 z-200 rounded-md bg-navy-800 px-18px py-3 font-semibold text-white focus:top-2">Lewati ke konten</a>
      <SiteHeader user={user ? { full_name: user.full_name, role: user.role } : null} />
      <main id="konten" tabIndex={-1} className="outline-none">{children}</main>
      <Footer />
    </>
  );
}