import DashShell from "@/components/DashShell";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { requireUser } from "@/lib/session";
import { MENUS } from "@/lib/nav";
import { staffCounts, unreadCount } from "@/lib/data/loans";
import { isBorrower } from "@/lib/config";

export const metadata = { robots: { index: false } };

export default async function DashLayout({ children }) {
  const user = await requireUser();
  const [counts, unread] = await Promise.all([
    user.role === "pegawai" ? staffCounts() : Promise.resolve({}),
    isBorrower(user.role) ? unreadCount(user.id) : Promise.resolve(0),
  ]);

  if (isBorrower(user.role)) {
    return (
      <>
        <a
          href="#konten"
          className="absolute -top-16 left-2 z-[200] rounded-md bg-navy-800 px-4 py-3 font-semibold text-white focus:top-2"
        >
          Lewati ke konten
        </a>
        <SiteHeader
          user={{ full_name: user.full_name, email: user.email, role: user.role }}
          unread={unread}
        />
        <main
          id="konten"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 pt-7 pb-6 outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <DashShell
      user={{ full_name: user.full_name, role: user.role }}
      menu={MENUS[user.role]}
      counts={counts}
      unread={unread}
    >
      {children}
    </DashShell>
  );
}