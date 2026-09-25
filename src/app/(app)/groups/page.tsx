import Link from "next/link";
import { Box } from "@/components/box";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getMyGroups } from "@/lib/data/groups";

export default async function GroupsPage() {
  const [t, me] = await Promise.all([getServerT(), getCurrentUser()]);
  const groups = await getMyGroups(me!.id);
  return (
    <Box as="h1" title={t("groups.title")}>
      {groups.length === 0 ? <p className="p-2">{t("groups.empty")}</p> : (
        <ul className="p-2">
          {groups.map((g) => (
            <li key={g.id} className="py-1">
              <Link href={`/groups/${g.id}`} className="font-bold text-primary hover:underline">{g.name}</Link>
              <span className="block text-xs">{g.is_private ? t("groups.private") : t("groups.public")} · {g.description}</span>
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
}
