"use client";

import { useState } from "react";
import { addPostComment } from "@/app/(app)/compose";
import { useT } from "@/i18n/client";
import { fullName, type PublicPerson } from "@/lib/format";
import { Avatar } from "./avatar";
import { PersonLink } from "./person-link";
import { SubmitButton } from "./submit-button";

export type CommentItem = { id: string; author: PublicPerson; body: React.ReactNode };

// Komentarz główny z odpowiedziami (1 poziom). „Odpowiedz” — przy komentarzu i przy każdej odpowiedzi —
// otwiera pole w tym wątku z @imieniem adresata. Nowe odpowiedzi dopisywane lokalnie.
export function CommentThread({ postId, root, replies }: { postId: string; root: CommentItem; replies: CommentItem[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [mention, setMention] = useState("");
  const [added, setAdded] = useState<CommentItem[]>([]);
  const all = [...replies, ...added];

  const replyTo = (person: PublicPerson) => {
    setMention(`@${fullName(person)} `);
    setOpen(true);
  };

  async function submit(formData: FormData) {
    const reply = await addPostComment(postId, root.id, formData).catch(() => null);
    if (!reply) return;
    setAdded((a) => [...a, reply]);
    setOpen(false);
  }

  return (
    <li className="py-1">
      <CommentRow item={root} onReply={() => replyTo(root.author)} />
      {(all.length > 0 || open) && (
        <ul aria-label={t("compose.replies")} className="ml-8 border-l-2 border-light pl-2">
          {all.map((r) => (
            <li key={r.id}>
              <CommentRow item={r} onReply={() => replyTo(r.author)} />
            </li>
          ))}
          {open && (
            <li>
              <form action={submit} className="flex gap-2 py-1">
                <label htmlFor={`reply-${root.id}`} className="sr-only">{t("compose.replyPlaceholder")}</label>
                <input
                  key={mention}
                  id={`reply-${root.id}`}
                  name="body"
                  required
                  maxLength={2000}
                  autoComplete="off"
                  autoFocus
                  defaultValue={mention}
                  placeholder={t("compose.replyPlaceholder")}
                  onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
                  onKeyDown={(e) => e.key === "Escape" && e.currentTarget.value.trim() === mention.trim() && setOpen(false)}
                  className="min-w-0 flex-1 border border-light bg-bg p-1 text-xs"
                />
                <SubmitButton pendingLabel={t("compose.sending")}>{t("compose.send")}</SubmitButton>
              </form>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

function CommentRow({ item, onReply }: { item: CommentItem; onReply: () => void }) {
  const t = useT();
  return (
    <div className="flex gap-2 py-1">
      <Avatar person={item.author} size="sm" />
      <div>
        <PersonLink person={item.author} /> {item.body}
        <div>
          <button type="button" onClick={onReply} className="text-primary hover:underline">{t("compose.reply")}</button>
        </div>
      </div>
    </div>
  );
}
