import { Avatar } from "@/components/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box } from "@/components/box";
import { MarkRead } from "@/components/mark-read";
import { PersonLink } from "@/components/person-link";
import { SubmitButton } from "@/components/submit-button";
import { Body } from "@/components/post-card";
import { getLocale, getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversation } from "@/lib/data/messages";
import { fullName, timeAgo } from "@/lib/format";
import { addMessage } from "../../compose";
import { markRead } from "./actions";

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const [t, locale, me] = await Promise.all([getServerT(), getLocale(), getCurrentUser()]);
  const c = await getConversation(id, me!.id);
  if (!c) notFound();
  return (
    <>
      {c.unread && <MarkRead action={markRead.bind(null, c.id)} />}
      <Link href="/messages" className="mb-2 inline-block text-xs text-primary hover:underline">{t("messages.back")}</Link>
      <Box as="h1" title={c.name}>
        {c.is_group && <p className="border-b border-light p-2 text-xs">{t("messages.members", { names: c.members.map(fullName).join(", ") })}</p>}
        {c.messages.length === 0 ? <p className="p-2">{t("messages.noMessages")}</p> : (
          <ol className="p-2">
            {c.messages.map((m) => (
              <li key={m.id} className={`py-1 ${m.author_id === me!.id ? "text-right" : ""}`}>
                <span className={`flex items-center gap-2 text-xs ${m.author_id === me!.id ? "justify-end" : ""}`}><Avatar person={m.author} size="sm" /><span><PersonLink person={m.author} /> · {timeAgo(m.created_at, locale)}</span></span>
                <p><Body text={m.body} /></p>
              </li>
            ))}
          </ol>
        )}
        <form action={addMessage.bind(null, c.id)} className="flex gap-2 border-t border-light p-2">
          <label htmlFor="message" className="sr-only">{t("compose.message")}</label>
          <input
            id="message"
            name="body"
            required
            maxLength={2000}
            autoComplete="off"
            autoFocus
            placeholder={t("compose.message")}
            className="min-w-0 flex-1 border border-light bg-bg p-2 text-sm"
          />
          <SubmitButton pendingLabel={t("compose.sending")}>{t("compose.send")}</SubmitButton>
        </form>
      </Box>
    </>
  );
}
