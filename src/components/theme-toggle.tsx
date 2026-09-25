"use client";

import { useSyncExternalStore } from "react";
import { saveTheme } from "@/app/actions";
import { useT } from "@/i18n/client";

type Theme = "light" | "dark";
const dark = "(prefers-color-scheme: dark)";

// Motyw faktycznie widoczny — przy „system” rozstrzyga preferencja systemu.
function current(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : matchMedia(dark).matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = matchMedia(dark);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

// Kolory suwaka zależnie od tła: w niebieskim headerze biały, w menu (jasne tło) niebieski.
const tones = {
  header: { track: "border-bg", on: "bg-bg", knobOff: "bg-bg", knobOn: "bg-primary" },
  menu: { track: "border-primary", on: "bg-primary", knobOff: "bg-primary", knobOn: "bg-bg" },
};

// Przełącznik „Tryb ciemny” (role=switch). Wszystkie instancje zsynchronizowane przez atrybut data-theme.
export function ThemeToggle({ serverTheme, tone, className }: { serverTheme: Theme; tone: keyof typeof tones; className: string }) {
  const t = useT();
  const isDark = useSyncExternalStore(subscribe, current, () => serverTheme) === "dark";
  const c = tones[tone];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={() => {
        const next: Theme = isDark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        saveTheme(next).catch(() => {}); // zapis w tle; motyw i tak już zmieniony
      }}
      className={`items-center gap-2 text-xs ${className}`}
    >
      {/* Tor 28px − ramka − padding = 24px, gałka 12px → przesuw o 12px (translate-x-3). */}
      <span aria-hidden className={`flex h-4 w-7 items-center border p-px transition-colors duration-150 motion-reduce:transition-none ${c.track} ${isDark ? c.on : ""}`}>
        <span className={`size-3 transition-transform duration-150 motion-reduce:transition-none ${isDark ? `translate-x-3 ${c.knobOn}` : c.knobOff}`} />
      </span>
      {t("nav.themeDark")}
    </button>
  );
}
