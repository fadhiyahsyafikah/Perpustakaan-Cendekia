import DashShell from "@/components/DashShell";
import { requireUser } from "@/lib/session";
import { MENUS } from "@/lib/nav";
import { staffCounts, unreadCount } from "@/lib/data/loans";
import { isBorrower } from "@/lib/config";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { robots: { index: false } };

export default async function DashLayout({ children }) {
  const user = await requireUser();
  const [counts, unread] = await Promise.all([
    user.role === "pegawai" ? staffCounts() : Promise.resolve({}),
    isBorrower(user.role) ? unreadCount(user.id) : Promise.resolve(0),
  ]);
  return (
    <DashShell user={{ full_name: user.full_name, role: user.role }} menu={MENUS[user.role]} counts={counts} unread={unread}>
      {children}
    </DashShell>
  );
}
