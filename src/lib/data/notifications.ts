import "server-only";
import { isMock } from "../env";
import { db } from "./mock-db";
import { paginate, type Page, type Range } from "./posts";
import type { Notification, Profile } from "./types";

// Gałąź Supabase — etap 8.

export async function getNotifications(userId: string): Promise<(Notification & { actor: Profile })[]> {
  if (!isMock) return [];
  return db.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((n) => ({ ...n, actor: db.profiles.find((p) => p.id === n.actor_id)! }));
}

export async function getNotificationsPage(userId: string, range: Range): Promise<Page<Notification & { actor: Profile }>> {
  return paginate(await getNotifications(userId), range);
}

export async function unreadNotifications(userId: string) {
  return (await getNotifications(userId)).filter((n) => !n.read_at).length;
}

export async function markNotificationsRead(userId: string) {
  if (!isMock) return;
  const now = new Date().toISOString();
  db.notifications.filter((n) => n.user_id === userId && !n.read_at).forEach((n) => (n.read_at = now));
}
