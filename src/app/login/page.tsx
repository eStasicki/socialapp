import { getServerT } from "@/i18n/server";
import { button } from "@/components/button-styles";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isMock } from "@/lib/env";
import { login } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const t = await getServerT();
  if (await getCurrentUser()) redirect("/");
  const { error } = await searchParams;
  return (
    <main className="px-4">
      <header className="-mx-4 bg-primary px-4 py-2 font-bold text-bg">{t("app.name")}</header>
      <section className="mx-auto mt-8 max-w-sm border border-light">
        <h1 className="bg-light px-2 py-1 font-bold">{t("login.title")}</h1>
        <form action={login} className="flex flex-col gap-2 p-2">
          {error && <p role="alert" className="border border-primary p-2 text-xs">{t("login.error")}</p>}
          <label className="flex flex-col gap-1 text-xs">
            {t("login.email")}
            <input name="email" type="email" required autoComplete="email" className="border border-light bg-bg p-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            {t("login.password")}
            <input name="password" type="password" required autoComplete="current-password" className="border border-light bg-bg p-2 text-sm" />
          </label>
          <button className={button.primary}>{t("login.submit")}</button>
          {isMock && <p className="text-xs">{t("login.mockHint")}</p>}
        </form>
      </section>
    </main>
  );
}
