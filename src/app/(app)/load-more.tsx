"use server";

import { z } from "zod";
import { NotificationItem } from "@/components/notification-item";
import { PostCard } from "@/components/post-card";
import { getCurrentUser } from "@/lib/auth";
import { getGroup } from "@/lib/data/groups";
import { getNotificationsPage } from "@/lib/data/notifications";
import { canView, getProfile } from "@/lib/data/people";
import { getFeed, getGroupPosts, getWall, type FeedPost, type Page } from "@/lib/data/posts";
import { MAX_BATCH } from "@/lib/viewport";

// Kolejne porcje list dla <InfiniteList>. Każda akcja sprawdza dostęp tak samo jak strona.
const range = z.object({ offset: z.number().int().min(1).max(10_000), limit: z.number().int().min(1).max(MAX_BATCH) });
const id = z.string().min(1).max(64);
const none = { node: null, count: 0, hasMore: false };

const posts = ({ items, hasMore }: Page<FeedPost>) => ({ node: items.map((p) => <PostCard key={p.id} post={p} />), count: items.length, hasMore });

async function me() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function loadFeed(offset: number, limit: number) {
  const user = await me();
  return posts(await getFeed(user.id, range.parse({ offset, limit })));
}

export async function loadWall(ownerId: string, offset: number, limit: number) {
  const user = await me();
  const owner = await getProfile(id.parse(ownerId));
  if (!owner || !canView(owner, user.id, "wall")) return none;
  return posts(await getWall(owner.id, user.id, range.parse({ offset, limit })));
}

export async function loadGroupPosts(groupId: string, offset: number, limit: number) {
  const user = await me();
  const group = await getGroup(id.parse(groupId), user.id);
  if (!group) return none;
  return posts(await getGroupPosts(group.id, user.id, range.parse({ offset, limit })));
}

export async function loadNotifications(offset: number, limit: number) {
  const user = await me();
  const { items, hasMore } = await getNotificationsPage(user.id, range.parse({ offset, limit }));
  return { node: <ul>{items.map((n) => <li key={n.id}><NotificationItem n={n} /></li>)}</ul>, count: items.length, hasMore };
}
