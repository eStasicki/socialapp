import Link from "next/link";
import { getLocale, getServerT } from "@/i18n/server";
import type { Notification, Profile } from "@/lib/data/types";
import { fullName, profileHref, timeAgo } from "@/lib/format";

function href(n: Notification & { actor: Profile }) {
  switch (n.target_type) {
    case "friendship": return n.type === "friend_accept" ? profileHref(n.actor) : "/friends";
    case "group": return `/groups/${n.target_id}`;
    default: return "/"; // ponytail: link do konkretnego posta, gdy powstanie widok /post/[id]
  }
}

export async function NotificationItem({ n }: { n: Notification & { actor: Profile } }) {
  const [t, locale] = await Promise.all([getServerT(), getLocale()]);
  return (
    <Link href={href(n)} className={`block border-t border-light p-2 hover:underline ${n.read_at ? "" : "font-bold"}`}>
      {t(`notifications.${n.type}`, { actor: fullName(n.actor) })}
      <span className="block text-xs font-normal">{timeAgo(n.created_at, locale)}</span>
    </Link>
  );
}
