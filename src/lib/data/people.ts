import "server-only";
import { isMock } from "../env";
import { db } from "./mock-db";
import type { Profile, Visibility } from "./types";

// Gałąź Supabase dla zapytań poniżej dochodzi w etapach 3–5 (tabele jeszcze nie istnieją).

export async function getProfileByPublicId(publicId: string): Promise<Profile | null> {
  if (!isMock) return null;
  return db.profiles.find((p) => p.public_id === publicId) ?? null;
}

export async function getProfile(id: string): Promise<Profile | null> {
  if (!isMock) return null;
  return db.profiles.find((p) => p.id === id) ?? null;
}

export function friendIds(userId: string) {
  return db.friendships
    .filter((f) => f.status === "accepted" && (f.requester_id === userId || f.addressee_id === userId))
    .map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id));
}

export const areFriends = (a: string, b: string) => friendIds(a).includes(b);
const isFamily = (owner: string, member: string) => db.familyMarks.some((m) => m.owner_id === owner && m.member_id === member);
const isBlocked = (a: string, b: string) => db.blocks.some((x) => (x.blocker_id === a && x.blocked_id === b) || (x.blocker_id === b && x.blocked_id === a));

// Odpowiednik funkcji SQL can_view() z RLS.
export function canView(owner: Profile, viewerId: string, scope: "profile" | "wall") {
  if (owner.id === viewerId) return true;
  if (isBlocked(owner.id, viewerId)) return false;
  const visibility: Visibility = scope === "profile" ? owner.profile_visibility : owner.wall_visibility;
  switch (visibility) {
    case "public": return true;
    case "friends": return areFriends(owner.id, viewerId);
    case "family": return areFriends(owner.id, viewerId) && isFamily(owner.id, viewerId);
    case "custom": return db.visibilityAllow.some((a) => a.owner_id === owner.id && a.viewer_id === viewerId && a.scope === scope);
  }
}

export async function getFriends(userId: string): Promise<(Profile & { family: boolean })[]> {
  if (!isMock) return [];
  return friendIds(userId).map((id) => ({ ...db.profiles.find((p) => p.id === id)!, family: isFamily(userId, id) }));
}

export async function getFriendRequests(userId: string): Promise<Profile[]> {
  if (!isMock) return [];
  return db.friendships
    .filter((f) => f.status === "pending" && f.addressee_id === userId)
    .map((f) => db.profiles.find((p) => p.id === f.requester_id)!);
}

export async function searchPeople(q: string, viewerId: string): Promise<Profile[]> {
  if (!isMock || !q) return [];
  const needle = q.toLocaleLowerCase("pl");
  return db.profiles.filter((p) => !isBlocked(p.id, viewerId) && `${p.first_name} ${p.last_name}`.toLocaleLowerCase("pl").includes(needle));
}

export type ProfileInfo = Pick<Profile, "first_name" | "last_name" | "city" | "school" | "birthday" | "about">;

export async function updateProfileInfo(userId: string, data: ProfileInfo) {
  if (!isMock) return; // etap 3: update profiles (RLS: tylko właściciel)
  Object.assign(db.profiles.find((p) => p.id === userId)!, data);
}

export async function updateTheme(userId: string, theme: Profile["theme"]) {
  if (!isMock) return; // etap 2: update profiles
  db.profiles.find((p) => p.id === userId)!.theme = theme;
}

export async function updateSettings(userId: string, data: Pick<Profile, "theme" | "profile_visibility" | "wall_visibility">) {
  if (!isMock) return; // etap 2/5: update profiles
  Object.assign(db.profiles.find((p) => p.id === userId)!, data);
}

// Odpowiedź na zaproszenie: akceptacja = status accepted + powiadomienie dla zapraszającego; odrzucenie = usunięcie.
// W Supabase powiadomienie tworzy trigger SQL (etap 8). false = brak takiego zaproszenia.
export async function respondToFriendRequest(userId: string, requesterId: string, accept: boolean) {
  if (!isMock) return false; // etap 4
  const i = db.friendships.findIndex((f) => f.status === "pending" && f.requester_id === requesterId && f.addressee_id === userId);
  if (i < 0) return false;
  const now = new Date().toISOString();
  if (accept) {
    db.friendships[i].status = "accepted";
    db.notifications.push({
      id: crypto.randomUUID(), user_id: requesterId, actor_id: userId, type: "friend_accept",
      target_type: "friendship", target_id: userId, read_at: null, created_at: now,
    });
  } else {
    db.friendships.splice(i, 1);
  }
  // Powiadomienie o tym zaproszeniu jest już obsłużone.
  db.notifications
    .filter((n) => n.user_id === userId && n.type === "friend_request" && n.actor_id === requesterId && !n.read_at)
    .forEach((n) => (n.read_at = now));
  return true;
}
