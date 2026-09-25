"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { respondToFriendRequest } from "@/lib/data/people";

const id = z.string().min(1).max(64);

async function respond(requesterId: string, accept: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await respondToFriendRequest(user.id, id.parse(requesterId), accept);
  revalidatePath("/", "layout"); // lista znajomych + licznik w nawigacji
}

export async function acceptFriend(requesterId: string) {
  await respond(requesterId, true);
}

export async function declineFriend(requesterId: string) {
  await respond(requesterId, false);
}
