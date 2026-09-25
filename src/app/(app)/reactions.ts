"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { toggleReaction } from "@/lib/data/posts";

const schema = z.object({ postId: z.string().min(1).max(64), type: z.enum(["like", "love", "haha", "wow", "sad"]) });

// Zwraca aktualny stan reakcji posta, żeby działało też w postach doczytanych przy scrollu (bez revalidate).
export async function reactToPost(postId: string, type: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const input = schema.parse({ postId, type });
  return toggleReaction(input.postId, user.id, input.type);
}
