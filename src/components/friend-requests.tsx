import { acceptFriend, declineFriend } from "@/app/(app)/friends/actions";
import { getServerT } from "@/i18n/server";
import type { Profile } from "@/lib/data/types";
import { Avatar } from "./avatar";
import { button } from "./button-styles";
import { PersonLink } from "./person-link";

// Lista zaproszeń z akceptacją/odrzuceniem — na /friends i na stronie głównej.
export async function FriendRequests({ requests }: { requests: Profile[] }) {
  const t = await getServerT();
  return (
    <ul className="p-2">
      {requests.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-2 py-1">
          <Avatar person={p} size="md" />
          <PersonLink person={p} />
          <span className="ml-auto flex gap-1">
            <form action={acceptFriend.bind(null, p.id)}>
              <button className={button.primary}>{t("friends.accept")}</button>
            </form>
            <form action={declineFriend.bind(null, p.id)}>
              <button className={button.secondary}>{t("friends.decline")}</button>
            </form>
          </span>
        </li>
      ))}
    </ul>
  );
}
