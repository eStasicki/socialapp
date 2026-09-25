import { Box } from "@/components/box";
import { InfiniteList } from "@/components/infinite-list";
import { MarkRead } from "@/components/mark-read";
import { NotificationItem } from "@/components/notification-item";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsPage } from "@/lib/data/notifications";
import { firstBatch } from "@/lib/viewport-server";
import { loadNotifications } from "../load-more";
import { markAllRead } from "./actions";

export default async function NotificationsPage() {
  const [t, me] = await Promise.all([getServerT(), getCurrentUser()]);
  const { items, hasMore } = await getNotificationsPage(me!.id, await firstBatch("notification"));
  return (
    <Box as="h1" title={t("notifications.title")}>
      {items.some((n) => !n.read_at) && <MarkRead action={markAllRead} />}
      {items.length === 0 ? <p className="p-2">{t("notifications.empty")}</p> : (
        <ul className="-mt-px">{items.map((n) => <li key={n.id}><NotificationItem n={n} /></li>)}</ul>
      )}
      <InfiniteList load={loadNotifications} initialCount={items.length} hasMore={hasMore} kind="notification" />
    </Box>
  );
}
