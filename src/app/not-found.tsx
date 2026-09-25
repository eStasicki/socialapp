import Link from "next/link";
import { getServerT } from "@/i18n/server";

export default async function NotFound() {
  const t = await getServerT();
  return (
    <main className="mx-auto mt-8 max-w-sm border border-light">
      <h1 className="bg-light px-2 py-1 font-bold">{t("common.notFound")}</h1>
      <p className="p-2"><Link href="/" className="text-primary hover:underline">{t("common.backHome")}</Link></p>
    </main>
  );
}
