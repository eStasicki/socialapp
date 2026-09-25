"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { sendMessage } from "@/lib/data/messages";
import { addComment, createPost } from "@/lib/data/posts";
import { publicPerson } from "@/lib/format";

const id = z.string().min(1).max(64);
const text = (max: number) => z.string().trim().min(1).max(max);

async function me() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function addPost(kind: "wall" | "group", targetId: string, formData: FormData) {
  const user = await me();
  const body = text(5000).safeParse(formData.get("body"));
  if (!body.success) return;
  const target = kind === "group" ? { group: id.parse(targetId) } : { wall: id.parse(targetId) };
  if (await createPost(user.id, target, body.data)) revalidatePath("/", "layout");
}

export async function addMessage(conversationId: string, formData: FormData) {
  const user = await me();
  const body = text(2000).safeParse(formData.get("body"));
  if (!body.success) return;
  if (await sendMessage(id.parse(conversationId), user.id, body.data)) revalidatePath("/", "layout");
}

// Zwraca utworzony komentarz — komponent dopisuje go sam (działa też w postach doczytanych przy scrollu).
export async function addPostComment(postId: string, parentId: string | null, formData: FormData) {
  const user = await me();
  const body = text(2000).safeParse(formData.get("body"));
  if (!body.success) return null;
  const c = await addComment(id.parse(postId), user.id, body.data, parentId === null ? null : id.parse(parentId));
  if (!c) return null;
  return { id: c.id, parentId: c.parent_id, body: c.body, author: publicPerson(c.author) };
}
