import Link from "next/link";
import { Box } from "@/components/box";
import { FriendRequests } from "@/components/friend-requests";
import { InfiniteList } from "@/components/infinite-list";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFriendRequests } from "@/lib/data/people";
import { getFeed } from "@/lib/data/posts";
import { firstBatch } from "@/lib/viewport-server";
import { loadFeed } from "./load-more";

export default async function Home() {
  const [t, user] = await Promise.all([getServerT(), getCurrentUser()]);
  const [{ items, hasMore }, requests] = await Promise.all([getFeed(user!.id, await firstBatch("post")), getFriendRequests(user!.id)]);
  return (
    <>
      {requests.length > 0 && (
        <Box title={t("friends.requests")}>
          <FriendRequests requests={requests.slice(0, 3)} />
          {requests.length > 3 && (
            <Link href="/friends" className="block px-2 pb-2 text-xs text-primary hover:underline">
              {t("friends.seeAllRequests", { count: requests.length })}
            </Link>
          )}
        </Box>
      )}
      <Box as="h1" title={t("home.title")}>
        <PostComposer kind="wall" targetId={user!.id} placeholder={t("compose.placeholderOwn")} />
        {items.length === 0 ? <p className="p-2">{t("home.empty")}</p> : items.map((p) => <PostCard key={p.id} post={p} />)}
        <InfiniteList key={items[0]?.id} load={loadFeed} initialCount={items.length} hasMore={hasMore} kind="post" />
      </Box>
    </>
  );
}
