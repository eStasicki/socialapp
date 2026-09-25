import Link from "next/link";
import { Box } from "@/components/box";
import { getLocale, getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "@/lib/data/messages";
import { timeAgo } from "@/lib/format";

export default async function MessagesPage() {
  const [t, locale, me] = await Promise.all([getServerT(), getLocale(), getCurrentUser()]);
  const conversations = await getConversations(me!.id);
  return (
    <Box as="h1" title={t("messages.title")}>
      {conversations.length === 0 ? <p className="p-2">{t("messages.empty")}</p> : (
        <ul>
          {conversations.map((c) => (
            <li key={c.id} className="border-t border-light first:border-t-0">
              <Link href={`/messages/${c.id}`} className="block p-2 hover:underline">
                <span className={c.unread ? "font-bold text-primary" : "text-primary"}>{c.name}</span>
                {c.unread && <span className="ml-2 bg-primary px-1 text-xs text-bg">{t("messages.unread")}</span>}
                {c.last && <span className="block truncate text-xs">{c.last.body} · {timeAgo(c.last.created_at, locale)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
}
