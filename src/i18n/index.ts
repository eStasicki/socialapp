import pl from "../../messages/pl.json";

export const locales = ["pl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pl";

type Dict = typeof pl;
const dicts: Record<Locale, Dict> = { pl };

type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];
export type Key = Paths<Dict>;

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export function getT(locale: Locale) {
  const dict = dicts[locale];
  return (key: Key, vars?: Record<string, string | number>) => {
    const text = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], dict) as string;
    return vars ? text.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? `{${v}}`)) : text;
  };
}
