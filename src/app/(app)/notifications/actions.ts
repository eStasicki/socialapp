"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/data/notifications";

export async function markAllRead() {
  const user = await getCurrentUser();
  if (!user) return;
  await markNotificationsRead(user.id);
  revalidatePath("/", "layout");
}
