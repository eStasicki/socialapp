import { Avatar } from "@/components/avatar";
import Link from "next/link";
import { Box } from "@/components/box";
import { PersonLink } from "@/components/person-link";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { searchGroups } from "@/lib/data/groups";
import { searchPeople } from "@/lib/data/people";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q: raw } = await searchParams;
  const q = (typeof raw === "string" ? raw : "").trim().slice(0, 100);
  const [t, me] = await Promise.all([getServerT(), getCurrentUser()]);
  if (!q) return <Box as="h1" title={t("nav.search")}><p className="p-2">{t("search.prompt")}</p></Box>;
  const [people, groups] = await Promise.all([searchPeople(q, me!.id), searchGroups(q)]);
  return (
    <>
      <h1 className="mb-2 font-bold">{t("search.title", { q })}</h1>
      <Box title={t("search.people")}>
        {people.length === 0 ? <p className="p-2">{t("search.none")}</p> : (
          <ul className="p-2">{people.map((p) => <li key={p.id} className="flex items-center gap-2 py-1"><Avatar person={p} size="md" /><PersonLink person={p} />{p.city && <span className="ml-2 text-xs">{p.city}</span>}</li>)}</ul>
        )}
      </Box>
      <Box title={t("search.groups")}>
        {groups.length === 0 ? <p className="p-2">{t("search.none")}</p> : (
          <ul className="p-2">{groups.map((g) => <li key={g.id} className="py-1"><Link href={`/groups/${g.id}`} className="font-bold text-primary hover:underline">{g.name}</Link></li>)}</ul>
        )}
      </Box>
    </>
  );
}
