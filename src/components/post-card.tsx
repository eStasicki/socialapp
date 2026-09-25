import Link from "next/link";
import { getServerT, getLocale } from "@/i18n/server";
import { mentionedPerson, type FeedPost } from "@/lib/data/posts";
import { fullName, profileHref, publicPerson, timeAgo } from "@/lib/format";
import { Avatar } from "./avatar";
import { PersonLink } from "./person-link";
import { CommentThread } from "./comment-thread";
import { PostFooter } from "./post-footer";

// Wzmianki zapisane jako @[user_id] → link do profilu.
export function Body({ text }: { text: string }) {
  return text.split(/(@\[[\w-]+\])/).map((part, i) => {
    const id = part.match(/^@\[([\w-]+)\]$/)?.[1];
    const person = id ? mentionedPerson(id) : null;
    if (id && !person) return "@?";
    return person ? <Link key={i} href={profileHref(person)} className="text-primary hover:underline">@{fullName(person)}</Link> : part;
  });
}

export async function PostCard({ post }: { post: FeedPost }) {
  const t = await getServerT();
  const locale = await getLocale();
  return (
    <article className="flex gap-2 border-t border-light p-2 first-of-type:border-t-0">
      <Avatar person={post.author} size="md" />
      <div className="min-w-0 flex-1">
      <p className="text-xs">
        <PersonLink person={post.author} />
        {post.wallOwner && <> → <PersonLink person={post.wallOwner} /></>}
        {post.groupName && <> {t("post.inGroup", { group: post.groupName })}</>}
        {" · "}<time dateTime={post.created_at}>{timeAgo(post.created_at, locale)}</time>
      </p>
      <p className="py-1"><Body text={post.body} /></p>
      {post.link_url && <a href={post.link_url} className="block border border-light p-2 text-xs text-primary hover:underline">{post.link_url}</a>}
      <PostFooter
        postId={post.id}
        counts={post.reactions}
        mine={post.myReaction}
        comments={post.comments.length > 0 && (
          <ul aria-label={t("post.comments")} className="mt-1 border-l-2 border-light pl-2 text-xs">
            {post.comments.map((c) => (
              <CommentThread
                key={c.id}
                postId={post.id}
                root={{ id: c.id, author: publicPerson(c.author), body: <Body text={c.body} /> }}
                replies={c.replies.map((r) => ({ id: r.id, author: publicPerson(r.author), body: <Body text={r.body} /> }))}
              />
            ))}
          </ul>
        )}
      />
      </div>
    </article>
  );
}
