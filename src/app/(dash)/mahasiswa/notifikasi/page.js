import { Bell, CheckCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { studentNotifications } from "@/lib/data/loans";
import { generateReminders } from "@/lib/services/loans";
import { PageHeader, EmptyState } from "@/components/ui";
import { ActionButton } from "@/components/form";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/notifications";
import { waktu } from "@/lib/format";
import { cx } from "@/lib/styles";
import { BORROWER_ROLES } from "@/lib/config";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = { title: "Notifikasi" };

export default async function NotifikasiPage() {
  const user = await requireUser(BORROWER_ROLES);
  await generateReminders(user.id).catch(() => {});
  const items = await studentNotifications(user.id);
  const unread = items.filter((n) => !n.is_read).length;
  return (
    <div className="grid max-w-[800px] gap-5">
      <PageHeader
        title="Notifikasi"
        subtitle="Pengingat jatuh tempo, denda baru, dan keputusan atas pengajuan Anda."
        actions={unread > 0 && <ActionButton action={markAllNotificationsRead} variant="outline" size="sm" icon={<CheckCheck size={18} aria-hidden="true" />}>Tandai semua sudah dibaca</ActionButton>}
      />
      {items.length ? (
        <div className="rounded-lg border border-n-200 bg-white p-5 shadow-sm sm:p-6">
          {items.map((n) => (
            <div key={n.id} className={cx("flex items-start gap-3 border-b border-n-200 py-3.5 [&_p]:mb-1", !n.is_read && "-mx-3 rounded-md bg-navy-50 px-3")}>
              {!n.is_read && <span className="mt-2 size-2.5 flex-none rounded-full border-2 border-navy-800 bg-yellow-500" aria-label="Belum dibaca" />}
              <div className="flex-1">
                <p><b>{n.type}</b>: {n.message}</p>
                <time className="text-[0.8125rem] text-n-500">{waktu(n.created_at)}</time>
              </div>
              {!n.is_read && <ActionButton action={markNotificationRead} fields={{ notification_id: n.id }} variant="ghost" size="sm" pendingText="...">Tandai dibaca</ActionButton>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Bell} title="Belum ada notifikasi" text="Notifikasi akan muncul saat ada pembaruan pada pinjaman atau denda Anda." />
      )}
    </div>
  );
}
