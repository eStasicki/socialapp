import { Box } from "@/components/box";
import { button } from "@/components/button-styles";
import { locales } from "@/i18n";
import { getLocale, getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { saveSettings } from "./actions";

const themes = ["light", "dark", "system"] as const;
const visibilities = ["public", "friends", "family", "custom"] as const;
const select = "min-h-11 border border-light bg-bg p-2 text-sm";

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const [t, locale, me, { saved }] = await Promise.all([getServerT(), getLocale(), getCurrentUser(), searchParams]);
  return (
    <Box as="h1" title={t("settings.title")}>
      <form action={saveSettings} className="flex max-w-sm flex-col gap-3 p-2">
        {saved && <p role="status" className="border border-primary p-2 text-xs">{t("settings.saved")}</p>}
        <label className="flex flex-col gap-1 text-xs">
          {t("settings.theme")}
          <select name="theme" defaultValue={me!.theme} className={select}>
            {themes.map((v) => <option key={v} value={v}>{t(`settings.themes.${v}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("settings.language")}
          <select name="locale" defaultValue={locale} className={select}>
            {locales.map((v) => <option key={v} value={v}>{t(`settings.languages.${v}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("settings.profileVisibility")}
          <select name="profile_visibility" defaultValue={me!.profile_visibility} className={select}>
            {visibilities.map((v) => <option key={v} value={v}>{t(`settings.visibility.${v}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("settings.wallVisibility")}
          <select name="wall_visibility" defaultValue={me!.wall_visibility} className={select}>
            {visibilities.map((v) => <option key={v} value={v}>{t(`settings.visibility.${v}`)}</option>)}
          </select>
        </label>
        <p className="text-xs">{t("settings.customHint")}</p>
        <button className={button.primary}>{t("settings.save")}</button>
      </form>
    </Box>
  );
}
