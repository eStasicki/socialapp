import "server-only";
import { isMock } from "../env";
import { db } from "./mock-db";
import { areFriends, canView, friendIds } from "./people";
import type { Comment, Post, Profile, ReactionType } from "./types";

export type FeedPost = Post & {
  author: Profile;
  wallOwner: Profile | null;
  groupName: string | null;
  reactions: ReactionCounts;
  myReaction: ReactionType | null;
  comments: CommentThread[];
};

export type CommentWithAuthor = Comment & { author: Profile };
export type CommentThread = CommentWithAuthor & { replies: CommentWithAuthor[] };

export type ReactionCounts = Partial<Record<ReactionType, number>>;

export type Range = { offset: number; limit: number };
export type Page<T> = { items: T[]; hasMore: boolean };

export function paginate<T>(all: T[], { offset, limit }: Range): Page<T> {
  return { items: all.slice(offset, offset + limit), hasMore: all.length > offset + limit };
}

const empty = { items: [], hasMore: false };

const byId = (id: string) => db.profiles.find((p) => p.id === id)!;
const newestFirst = (a: Post, b: Post) => b.created_at.localeCompare(a.created_at);

function countReactions(postId: string): ReactionCounts {
  return db.reactions
    .filter((r) => r.target_type === "post" && r.target_id === postId)
    .reduce<ReactionCounts>((acc, r) => ({ ...acc, [r.type]: (acc[r.type] ?? 0) + 1 }), {});
}

const myReaction = (postId: string, userId: string) =>
  db.reactions.find((r) => r.target_type === "post" && r.target_id === postId && r.user_id === userId)?.type ?? null;

// Komentarze główne chronologicznie, każdy z odpowiedziami (też chronologicznie).
function threads(postId: string): CommentThread[] {
  const all = db.comments
    .filter((c) => c.post_id === postId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((c) => ({ ...c, author: byId(c.author_id) }));
  return all.filter((c) => !c.parent_id).map((c) => ({ ...c, replies: all.filter((r) => r.parent_id === c.id) }));
}

function enrich(p: Post, viewerId: string): FeedPost {
  return {
    ...p,
    author: byId(p.author_id),
    wallOwner: p.wall_owner_id && p.wall_owner_id !== p.author_id ? byId(p.wall_owner_id) : null,
    groupName: db.groups.find((g) => g.id === p.group_id)?.name ?? null,
    reactions: countReactions(p.id),
    myReaction: myReaction(p.id, viewerId),
    comments: threads(p.id),
  };
}

// Gałąź Supabase — etap 6.

// Aktualności: moje posty, znajomych (jeśli ich tablica jest dla mnie widoczna) i z moich grup.
export async function getFeed(userId: string, range: Range): Promise<Page<FeedPost>> {
  if (!isMock) return empty;
  const people = new Set([userId, ...friendIds(userId)]);
  const groups = new Set(db.groupMembers.filter((m) => m.user_id === userId).map((m) => m.group_id));
  return pagePosts(db.posts.filter((p) => {
    if (p.group_id) return groups.has(p.group_id);
    const wall = byId(p.wall_owner_id ?? p.author_id);
    return (people.has(p.author_id) || people.has(wall.id)) && canView(wall, userId, "wall");
  }), range, userId);
}

export async function getWall(ownerId: string, viewerId: string, range: Range): Promise<Page<FeedPost>> {
  if (!isMock) return empty;
  return pagePosts(db.posts.filter((p) => p.wall_owner_id === ownerId), range, viewerId);
}

export async function getGroupPosts(groupId: string, viewerId: string, range: Range): Promise<Page<FeedPost>> {
  if (!isMock) return empty;
  return pagePosts(db.posts.filter((p) => p.group_id === groupId), range, viewerId);
}

// Sortuje, tnie na stronę i dopiero wtedy dociąga autorów/reakcje/komentarze.
function pagePosts(posts: Post[], range: Range, viewerId: string): Page<FeedPost> {
  const { items, hasMore } = paginate(posts.sort(newestFirst), range);
  return { items: items.map((p) => enrich(p, viewerId)), hasMore };
}

// Czy użytkownik widzi post — odpowiednik polityki RLS na posts.
function canSeePost(p: Post, userId: string) {
  if (p.group_id) {
    const group = db.groups.find((g) => g.id === p.group_id);
    return !!group && (!group.is_private || db.groupMembers.some((m) => m.group_id === group.id && m.user_id === userId));
  }
  return canView(byId(p.wall_owner_id ?? p.author_id), userId, "wall");
}

// Jedna reakcja na osobę: ten sam typ = zdjęcie reakcji, inny = podmiana. null = brak dostępu do posta.
export async function toggleReaction(postId: string, userId: string, type: ReactionType) {
  if (!isMock) return null; // etap 7: upsert/delete w reactions
  const post = db.posts.find((p) => p.id === postId);
  if (!post || !canSeePost(post, userId)) return null;
  const i = db.reactions.findIndex((r) => r.target_type === "post" && r.target_id === postId && r.user_id === userId);
  const current = i >= 0 ? db.reactions[i] : null;
  if (current) db.reactions.splice(i, 1);
  if (current?.type !== type) db.reactions.push({ user_id: userId, target_type: "post", target_id: postId, type });
  return { counts: countReactions(postId), mine: myReaction(postId, userId) };
}

export type PostTarget = { wall: string } | { group: string };

// Kto może pisać: na własnej tablicy, na tablicy znajomego (jeśli ją widzi), w grupie — tylko członek.
export function canPostTo(target: PostTarget, userId: string) {
  if ("group" in target) return db.groupMembers.some((m) => m.group_id === target.group && m.user_id === userId);
  if (target.wall === userId) return true;
  const owner = db.profiles.find((p) => p.id === target.wall);
  return !!owner && areFriends(owner.id, userId) && canView(owner, userId, "wall");
}

// null = brak uprawnień. Pierwszy URL z treści trafia do link_url (podgląd linku — etap 6).
export async function createPost(userId: string, target: PostTarget, body: string) {
  if (!isMock) return null; // etap 6: insert do posts (RLS pilnuje uprawnień)
  if (!canPostTo(target, userId)) return null;
  const post: Post = {
    id: crypto.randomUUID(),
    author_id: userId,
    wall_owner_id: "wall" in target ? target.wall : null,
    group_id: "group" in target ? target.group : null,
    body,
    image_path: null,
    link_url: body.match(/https?:\/\/\S+/)?.[0] ?? null,
    created_at: new Date().toISOString(),
  };
  db.posts.push(post);
  return post;
}

// Komentarz lub odpowiedź w wątku + powiadomienia (w Supabase: trigger, etap 8). null = brak dostępu / zły wątek.
// Odpowiedź na odpowiedź trafia do wątku jej komentarza głównego (1 poziom zagnieżdżenia).
export async function addComment(postId: string, userId: string, body: string, parentId: string | null = null) {
  if (!isMock) return null; // etap 7: insert do comments
  const post = db.posts.find((p) => p.id === postId);
  if (!post || !canSeePost(post, userId)) return null;
  const parent = parentId ? db.comments.find((c) => c.id === parentId && c.post_id === postId) : null;
  if (parentId && !parent) return null;
  const root = parent?.parent_id ? db.comments.find((c) => c.id === parent.parent_id)! : parent;
  const comment: Comment = { id: crypto.randomUUID(), post_id: postId, parent_id: root?.id ?? null, author_id: userId, body, created_at: new Date().toISOString() };
  db.comments.push(comment);
  const notify = (user_id: string, type: "comment" | "reply") =>
    db.notifications.push({ id: crypto.randomUUID(), user_id, actor_id: userId, type, target_type: "post", target_id: postId, read_at: null, created_at: comment.created_at });
  if (parent && parent.author_id !== userId) notify(parent.author_id, "reply");
  if (post.author_id !== userId && post.author_id !== parent?.author_id) notify(post.author_id, "comment");
  return { ...comment, author: byId(userId) };
}

export function mentionedPerson(id: string) {
  return isMock ? db.profiles.find((x) => x.id === id) ?? null : null;
}
