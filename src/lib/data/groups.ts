import "server-only";
import { isMock } from "../env";
import { db } from "./mock-db";
import type { Group, Profile } from "./types";

// Gałąź Supabase — etap 10.

export async function getMyGroups(userId: string): Promise<Group[]> {
  if (!isMock) return [];
  const ids = new Set(db.groupMembers.filter((m) => m.user_id === userId).map((m) => m.group_id));
  return db.groups.filter((g) => ids.has(g.id));
}

// Grupa prywatna widoczna tylko dla członków; null = brak dostępu lub nie istnieje.
export async function getGroup(id: string, userId: string) {
  if (!isMock) return null;
  const g = db.groups.find((x) => x.id === id);
  if (!g) return null;
  const members = db.groupMembers.filter((m) => m.group_id === id);
  const isMember = members.some((m) => m.user_id === userId);
  if (g.is_private && !isMember) return null;
  return { ...g, isMember, members: members.map((m) => ({ ...db.profiles.find((p) => p.id === m.user_id)!, role: m.role })) as (Profile & { role: string })[] };
}

export async function searchGroups(q: string): Promise<Group[]> {
  if (!isMock || !q) return [];
  const needle = q.toLocaleLowerCase("pl");
  return db.groups.filter((g) => !g.is_private && g.name.toLocaleLowerCase("pl").includes(needle));
}
