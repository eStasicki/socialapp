// Jedyne warianty przycisków. Hover/aktywny/wyłączony tylko zamianą 4 kolorów palety — bez przezroczystości i animacji.
const base = "min-h-11 border px-4 text-xs md:min-h-0 md:py-1";

export const button = {
  // Niebieski; hover = odwrócenie kolorów, klik = jasne tło, wyłączony = jasne tło bez hovera.
  primary: `${base} border-primary bg-primary text-bg enabled:hover:bg-bg enabled:hover:text-primary enabled:active:bg-light disabled:border-light disabled:bg-light disabled:text-primary`,
  // Obramowany; hover = niebieska ramka + jasne tło.
  secondary: `${base} border-light bg-bg text-primary enabled:hover:border-primary enabled:hover:bg-light enabled:active:border-primary`,
};
