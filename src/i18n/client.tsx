"use client";

import { createContext, useContext } from "react";
import { defaultLocale, getT, type Locale } from ".";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useT() {
  return getT(useContext(LocaleContext));
}
