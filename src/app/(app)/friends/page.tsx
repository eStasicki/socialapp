import { Avatar } from "@/components/avatar";
import { Box } from "@/components/box";
import { FriendRequests } from "@/components/friend-requests";
import { PersonLink } from "@/components/person-link";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFriendRequests, getFriends } from "@/lib/data/people";

export default async function FriendsPage() {
  const [t, me] = await Promise.all([getServerT(), getCurrentUser()]);
  const [friends, requests] = await Promise.all([getFriends(me!.id), getFriendRequests(me!.id)]);
  return (
    <>
      <Box as="h1" title={t("friends.requests")}>
        {requests.length === 0 ? <p className="p-2">{t("friends.noRequests")}</p> : (
          <FriendRequests requests={requests} />
        )}
      </Box>
      <Box title={t("friends.title")}>
        {friends.length === 0 ? <p className="p-2">{t("friends.none")}</p> : (
          <ul className="p-2">
            {friends.map((f) => (
              <li key={f.id} className="flex items-center gap-2 py-1">
                <Avatar person={f} size="md" />
                <PersonLink person={f} />
                {f.family && <span className="ml-2 border border-light px-1 text-xs">{t("friends.family")}</span>}
                {f.city && <span className="ml-2 text-xs">{f.city}</span>}
              </li>
            ))}
          </ul>
        )}
      </Box>
    </>
  );
}
