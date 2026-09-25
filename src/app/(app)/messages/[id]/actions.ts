"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { markConversationRead } from "@/lib/data/messages";

export async function markRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await markConversationRead(conversationId, user.id);
  revalidatePath("/", "layout");
}
