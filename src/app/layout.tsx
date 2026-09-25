import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getT } from "@/i18n";
import { LocaleProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import "./globals.css";

const themes = ["light", "dark", "system"];

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale());
  return { title: t("app.name"), description: t("app.description") };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  // ponytail: motyw z cookie; w etapie 2 źródłem będzie profiles.theme
  const theme = (await cookies()).get("theme")?.value;
  return (
    // suppressHydrationWarning: rozszerzenia przeglądarki (np. Bitdefender) dopisują atrybuty do <html>/<body>
    <html suppressHydrationWarning lang={locale} data-theme={themes.includes(theme!) ? theme : "system"}>
      <body suppressHydrationWarning className="min-h-screen bg-bg font-sans text-sm text-text">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
