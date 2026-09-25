import { Avatar } from "@/components/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box } from "@/components/box";
import { PersonLink } from "@/components/person-link";
import { InfiniteList } from "@/components/infinite-list";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { getLocale, getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { canView, getFriends, getProfileByPublicId } from "@/lib/data/people";
import { canPostTo, getWall } from "@/lib/data/posts";
import { fullName } from "@/lib/format";
import { firstBatch } from "@/lib/viewport-server";
import { loadWall } from "../../load-more";

export default async function ProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;
  const [t, locale, me, profile] = await Promise.all([getServerT(), getLocale(), getCurrentUser(), getProfileByPublicId(id)]);
  if (!profile) notFound();
  if (!canView(profile, me!.id, "profile")) {
    return <Box as="h1" title={fullName(profile)}><p className="p-2">{t("profile.private")}</p></Box>;
  }
  const friends = await getFriends(profile.id);
  const wall = canView(profile, me!.id, "wall") ? await getWall(profile.id, me!.id, await firstBatch("post")) : null;
  const canPost = canPostTo({ wall: profile.id }, me!.id);
  const info: [string, string | null][] = [
    [t("profile.city"), profile.city],
    [t("profile.school"), profile.school],
    [t("profile.birthday"), profile.birthday && new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(profile.birthday))],
    [t("profile.about"), profile.about],
  ];
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="md:w-48 md:shrink-0">
        <div className="mb-2 max-w-48">
          <Avatar person={profile} size="lg" eager />
        </div>
        {profile.id === me!.id && (
          <Link href="/profile/edit" className="mb-2 block border border-light p-2 text-center text-xs text-primary hover:border-primary">
            {t("profile.edit.link")}
          </Link>
        )}
        {friends.length > 0 && (
          <Box title={t("profile.friends", { count: friends.length })}>
            <ul className="grid grid-cols-2 gap-2 p-2 text-xs">
              {friends.slice(0, 6).map((f) => <li key={f.id} className="flex flex-col gap-1"><Avatar person={f} size="lg" /><PersonLink person={f} /></li>)}
            </ul>
            {friends.length > 6 && <Link href="/friends" className="block px-2 pb-2 text-xs text-primary hover:underline">{t("profile.seeAll")}</Link>}
          </Box>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Box as="h1" title={fullName(profile)}>
          {info.some(([, v]) => v) && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-2 text-xs">
              {info.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="contents"><dt className="font-bold">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
        </Box>
        {(canPost || wall === null || wall.items.length > 0) && (
          <Box title={t("profile.wall")}>
            {canPost && (
              <PostComposer
                kind="wall"
                targetId={profile.id}
                placeholder={profile.id === me!.id ? t("compose.placeholderOwn") : t("compose.placeholderWall", { name: profile.first_name })}
              />
            )}
            {wall === null ? <p className="p-2">{t("profile.wallPrivate")}</p> : (
              <>
                {wall.items.map((p) => <PostCard key={p.id} post={p} />)}
                <InfiniteList key={wall.items[0]?.id} load={loadWall.bind(null, profile.id)} initialCount={wall.items.length} hasMore={wall.hasMore} kind="post" />
              </>
            )}
          </Box>
        )}
      </div>
    </div>
  );
}
