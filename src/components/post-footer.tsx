"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import type { ReactionCounts } from "@/lib/data/posts";
import type { ReactionType } from "@/lib/data/types";
import { CommentForm } from "./comment-form";
import { ReactionBar } from "./reaction-bar";

// Stopka posta: reakcje + „Skomentuj” w jednym wierszu, pod spodem komentarze (z serwera) i pole komentarza.
export function PostFooter({ postId, counts, mine, comments }: {
  postId: string;
  counts: ReactionCounts;
  mine: ReactionType | null;
  comments: React.ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReactionBar postId={postId} counts={counts} mine={mine}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={`comment-${postId}`}
          className="min-h-11 px-2 text-primary hover:underline md:min-h-0"
        >
          {t("compose.commentAction")}
        </button>
      </ReactionBar>
      {comments}
      <CommentForm postId={postId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
