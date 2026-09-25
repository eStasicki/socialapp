"use client";

import { startTransition, useOptimistic, useState } from "react";
import { reactToPost } from "@/app/(app)/reactions";
import { useT } from "@/i18n/client";
import type { ReactionCounts } from "@/lib/data/posts";
import type { ReactionType } from "@/lib/data/types";

const types: [ReactionType, string][] = [["like", "👍"], ["love", "❤️"], ["haha", "😂"], ["wow", "😮"], ["sad", "😢"]];
type State = { counts: ReactionCounts; mine: ReactionType | null };

// Ta sama logika co toggleReaction na serwerze — do natychmiastowego podglądu.
function apply({ counts, mine }: State, type: ReactionType): State {
  const next = { ...counts };
  if (mine) next[mine] = (next[mine] ?? 1) - 1;
  if (mine !== type) next[type] = (next[type] ?? 0) + 1;
  return { counts: next, mine: mine === type ? null : type };
}

export function ReactionBar({ postId, counts, mine, children }: { postId: string; children?: React.ReactNode } & State) {
  const t = useT();
  const [state, setState] = useState<State>({ counts, mine });
  const [optimistic, addOptimistic] = useOptimistic(state, apply);

  const react = (type: ReactionType) =>
    startTransition(async () => {
      addOptimistic(type);
      try {
        const result = await reactToPost(postId, type);
        if (result) setState(result);
      } catch {
        // podgląd optymistyczny sam się cofnie po zakończeniu przejścia
      }
    });

  return (
    <div role="group" aria-label={t("reactions.label")} className="flex flex-wrap gap-1 py-1 text-xs">
      {types.map(([type, emoji]) => {
        const count = optimistic.counts[type] ?? 0;
        const active = optimistic.mine === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => react(type)}
            aria-pressed={active}
            title={t(`reactions.${type}`)}
            className={`min-h-11 border px-2 md:min-h-0 md:py-0.5 ${active ? "border-primary bg-light font-bold" : "border-light hover:border-primary hover:bg-light"}`}
          >
            {emoji}
            {count > 0 && <span className="ml-1">{count}</span>}
            <span className="sr-only"> {t(`reactions.${type}`)}</span>
          </button>
        );
      })}
      {children}
    </div>
  );
}
