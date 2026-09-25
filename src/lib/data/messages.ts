import "server-only";
import { isMock } from "../env";
import { db } from "./mock-db";
import type { Conversation, Message, Profile } from "./types";

// Gałąź Supabase — etap 9.

export type ConversationSummary = Conversation & { name: string; last: Message | null; unread: boolean };

const members = (conversationId: string) => db.conversationMembers.filter((m) => m.conversation_id === conversationId);
const profile = (id: string) => db.profiles.find((p) => p.id === id)!;

function summarize(c: Conversation, userId: string): ConversationSummary {
  const msgs = db.messages.filter((m) => m.conversation_id === c.id).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = msgs.at(-1) ?? null;
  const me = members(c.id).find((m) => m.user_id === userId);
  const other = members(c.id).find((m) => m.user_id !== userId);
  return {
    ...c,
    name: c.title ?? (other ? `${profile(other.user_id).first_name} ${profile(other.user_id).last_name}` : ""),
    last,
    unread: !!last && last.author_id !== userId && (!me?.last_read_at || me.last_read_at < last.created_at),
  };
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  if (!isMock) return [];
  return db.conversations
    .filter((c) => members(c.id).some((m) => m.user_id === userId))
    .map((c) => summarize(c, userId))
    .sort((a, b) => (b.last?.created_at ?? "").localeCompare(a.last?.created_at ?? ""));
}

// null gdy rozmowa nie istnieje albo użytkownik nie jest jej uczestnikiem.
export async function getConversation(id: string, userId: string) {
  if (!isMock) return null;
  const c = db.conversations.find((x) => x.id === id);
  if (!c || !members(id).some((m) => m.user_id === userId)) return null;
  return {
    ...summarize(c, userId),
    members: members(id).map((m) => profile(m.user_id)) as Profile[],
    messages: db.messages
      .filter((m) => m.conversation_id === id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((m) => ({ ...m, author: profile(m.author_id) })),
  };
}

export async function unreadConversations(userId: string) {
  return (await getConversations(userId)).filter((c) => c.unread).length;
}

export async function markConversationRead(id: string, userId: string) {
  if (!isMock) return;
  const me = members(id).find((m) => m.user_id === userId);
  if (me) me.last_read_at = new Date().toISOString();
}

// null = rozmowa nie istnieje albo użytkownik nie jest uczestnikiem.
export async function sendMessage(conversationId: string, userId: string, body: string) {
  if (!isMock) return null; // etap 9: insert do messages
  const me = members(conversationId).find((m) => m.user_id === userId);
  if (!me) return null;
  const now = new Date().toISOString();
  db.messages.push({ id: crypto.randomUUID(), conversation_id: conversationId, author_id: userId, body, created_at: now });
  me.last_read_at = now; // własna wiadomość = rozmowa przeczytana
  return true;
}
