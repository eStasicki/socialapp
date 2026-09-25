import Link from "next/link";
import { button } from "@/components/button-styles";
import { Box } from "@/components/box";
import { getServerT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { profileHref } from "@/lib/format";
import { saveProfile } from "./actions";

const input = "min-h-11 border border-light bg-bg p-2 text-sm";

export default async function EditProfilePage({ searchParams }: PageProps<"/profile/edit">) {
  const [t, me, { error }] = await Promise.all([getServerT(), getCurrentUser(), searchParams]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Box as="h1" title={t("profile.edit.title")}>
      <form action={saveProfile} className="flex max-w-md flex-col gap-3 p-2">
        {error && <p role="alert" className="border border-primary p-2 text-xs">{t("profile.edit.error")}</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-xs">
            {t("profile.edit.firstName")}
            <input name="first_name" required maxLength={50} defaultValue={me!.first_name} autoComplete="given-name" className={input} />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs">
            {t("profile.edit.lastName")}
            <input name="last_name" required maxLength={50} defaultValue={me!.last_name} autoComplete="family-name" className={input} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs">
          {t("profile.city")}
          <input name="city" maxLength={100} defaultValue={me!.city ?? ""} autoComplete="address-level2" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("profile.school")}
          <input name="school" maxLength={100} defaultValue={me!.school ?? ""} autoComplete="organization" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("profile.birthday")}
          <input name="birthday" type="date" min="1900-01-01" max={today} defaultValue={me!.birthday ?? ""} autoComplete="bday" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("profile.about")}
          <textarea name="about" maxLength={500} rows={4} defaultValue={me!.about ?? ""} className="resize-y border border-light bg-bg p-2 text-sm" />
        </label>
        <div className="flex items-center gap-3">
          <button className={button.primary}>{t("settings.save")}</button>
          <Link href={profileHref(me!)} className="text-xs text-primary hover:underline">{t("profile.edit.cancel")}</Link>
        </div>
      </form>
    </Box>
  );
}
