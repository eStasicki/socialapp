import { cookies } from "next/headers";
import { defaultLocale, getT, isLocale } from ".";

// ponytail: język z cookie; w etapie 2 źródłem będzie profiles.locale
export async function getLocale() {
  const value = (await cookies()).get("locale")?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getServerT() {
  return getT(await getLocale());
}
