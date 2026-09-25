import Link from "next/link";
import { getServerT } from "@/i18n/server";
import type { Key } from "@/i18n";
import { profileHref } from "@/lib/format";
import { unreadConversations } from "@/lib/data/messages";
import { unreadNotifications } from "@/lib/data/notifications";
import { getFriendRequests } from "@/lib/data/people";

export async function Nav({ user }: { user: { id: string; public_id: string } }) {
  const userId = user.id;
  const [t, requests, messages, notifications] = await Promise.all([
    getServerT(),
    getFriendRequests(userId).then((r) => r.length),
    unreadConversations(userId),
    unreadNotifications(userId),
  ]);
  const items: [string, Key, number?][] = [
    ["/", "nav.home"],
    [profileHref(user), "nav.profile"],
    ["/friends", "nav.friends", requests],
    ["/messages", "nav.messages", messages],
    ["/notifications", "nav.notifications", notifications],
    ["/groups", "nav.groups"],
    ["/settings", "nav.settings"],
  ];
  return (
    <nav>
      <ul className="text-xs">
        {items.map(([href, key, count]) => (
          <li key={href}>
            <Link href={href} className="block px-2 py-2 text-primary hover:bg-light hover:underline md:py-1">
              {t(key)}
              {!!count && <span className="font-bold"> ({count})</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
