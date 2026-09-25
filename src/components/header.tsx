import { cookies } from "next/headers";
import Link from "next/link";
import { logout } from "@/app/actions";
import { getServerT } from "@/i18n/server";
import type { Profile } from "@/lib/data/types";
import { profileHref } from "@/lib/format";
import { Nav } from "./nav";
import { ThemeToggle } from "./theme-toggle";

export async function Header({ user }: { user: Profile }) {
  const t = await getServerT();
  // ponytail: przy „system” serwer nie zna preferencji — zgaduje jasny, klient poprawia etykietę po hydracji
  const serverTheme = (await cookies()).get("theme")?.value === "dark" ? "dark" : "light";
  return (
    <header className="sticky top-0 z-20 bg-primary text-bg">
      <div className="mx-auto flex max-w-[980px] items-center gap-4 px-4 py-2">
        <Link href="/" className="text-sm font-bold">
          {t("app.name")}
        </Link>
        <form action="/search" className="flex-1">
          <label htmlFor="q" className="sr-only">
            {t("nav.search")}
          </label>
          <input id="q" name="q" type="search" placeholder={t("nav.search")} className="w-full max-w-60 bg-bg px-2 py-1 text-xs text-text" />
        </form>
        <Link href={profileHref(user)} className="hidden text-xs hover:underline md:block">
          {user.first_name} {user.last_name}
        </Link>
        <ThemeToggle serverTheme={serverTheme} tone="header" className="hidden hover:underline md:flex" />
        <form action={logout} className="hidden md:block">
          <button className="text-xs hover:underline">{t("nav.logout")}</button>
        </form>
        {/* Mobile: natywne <details> zamiast JS-owego menu */}
        <details className="relative md:hidden">
          <summary className="flex size-11 list-none items-center justify-center text-xs hover:underline">{t("nav.menu")}</summary>
          <div className="absolute right-0 z-10 w-48 border border-light bg-bg text-text">
            <Nav user={user} />
            <ThemeToggle serverTheme={serverTheme} tone="menu" className="flex min-h-11 w-full px-2 text-primary hover:bg-light hover:underline" />
            <form action={logout}>
              <button className="block w-full px-2 py-2 text-left text-xs text-primary hover:bg-light hover:underline">{t("nav.logout")}</button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
