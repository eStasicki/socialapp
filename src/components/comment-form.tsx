"use client";

import { useState } from "react";
import { addPostComment } from "@/app/(app)/compose";
import { useT } from "@/i18n/client";
import { CommentThread } from "./comment-thread";
import { SubmitButton } from "./submit-button";

type Added = NonNullable<Awaited<ReturnType<typeof addPostComment>>>;

// Nowe komentarze dopisywane lokalnie; po odświeżeniu strony renderuje je już serwer.
// Pole widoczne dopiero po kliknięciu „Skomentuj” (jak FB/LinkedIn); zwija się po wysłaniu albo Esc na pustym polu.
export function CommentForm({ postId, open, onClose }: { postId: string; open: boolean; onClose: () => void }) {
  const t = useT();
  const [added, setAdded] = useState<Added[]>([]);

  async function submit(formData: FormData) {
    const comment = await addPostComment(postId, null, formData).catch(() => null);
    if (!comment) return;
    setAdded((a) => [...a, comment]);
    onClose();
  }

  if (!open && added.length === 0) return null;
  return (
    <div className="mt-1 border-l-2 border-light pl-2 text-xs">
      {added.length > 0 && (
        <ul aria-label={t("post.comments")}>
          {added.map((c) => <CommentThread key={c.id} postId={postId} root={c} replies={[]} />)}
        </ul>
      )}
      {open && (
        <form action={submit} className="flex gap-2 py-1">
          <label htmlFor={`comment-${postId}`} className="sr-only">{t("compose.comment")}</label>
          <input
            id={`comment-${postId}`}
            name="body"
            required
            maxLength={2000}
            autoComplete="off"
            autoFocus
            placeholder={t("compose.comment")}
            onKeyDown={(e) => e.key === "Escape" && !e.currentTarget.value && onClose()}
            className="min-w-0 flex-1 border border-light bg-bg p-1 text-xs"
          />
          <SubmitButton pendingLabel={t("compose.sending")}>{t("compose.send")}</SubmitButton>
        </form>
      )}
    </div>
  );
}
