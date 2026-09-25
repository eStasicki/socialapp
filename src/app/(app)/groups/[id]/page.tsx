import { Avatar } from "@/components/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box } from "@/components/box";
import { PersonLink } from "@/components/person-link";
import { InfiniteList } from "@/components/infinite-list";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getGroup } from "@/lib/data/groups";
import { getGroupPosts } from "@/lib/data/posts";
import { firstBatch } from "@/lib/viewport-server";
import { loadGroupPosts } from "../../load-more";

export default async function GroupPage({ params }: PageProps<"/groups/[id]">) {
  const { id } = await params;
  const [t, me] = await Promise.all([getServerT(), getCurrentUser()]);
  const group = await getGroup(id, me!.id);
  if (!group) notFound();
  const posts = await getGroupPosts(group.id, me!.id, await firstBatch("post"));
  return (
    <div className="flex flex-col gap-4 md:flex-row-reverse">
      <div className="md:w-48 md:shrink-0">
        <Box title={t("groups.members", { count: group.members.length })}>
          <ul className="p-2 text-xs">
            {group.members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 py-1"><Avatar person={m} size="sm" /><span><PersonLink person={m} />{m.role === "admin" && ` (${t("groups.admin")})`}</span></li>
            ))}
          </ul>
        </Box>
        {group.isMember && <Link href={`/messages/${group.conversation_id}`} className="text-xs text-primary hover:underline">{t("groups.chat")}</Link>}
      </div>
      <div className="min-w-0 flex-1">
        <Box as="h1" title={group.name}>
          <p className="p-2 text-xs">{group.is_private ? t("groups.private") : t("groups.public")} · {group.description}</p>
        </Box>
        <Box title={t("groups.posts")}>
          {group.isMember && <PostComposer kind="group" targetId={group.id} placeholder={t("compose.placeholderGroup")} />}
          {posts.items.length === 0 ? <p className="p-2">{t("groups.noPosts")}</p> : posts.items.map((p) => <PostCard key={p.id} post={p} />)}
          <InfiniteList key={posts.items[0]?.id} load={loadGroupPosts.bind(null, group.id)} initialCount={posts.items.length} hasMore={posts.hasMore} kind="post" />
        </Box>
      </div>
    </div>
  );
}
