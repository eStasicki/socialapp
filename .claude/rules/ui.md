# Zasady UI

Wygląd jak Facebook z samego początku: płasko, gęsto, tekstowo, bez efektów.

## Paleta — tylko te 4 kolory

| Klasa Tailwind | Kolor     | Użycie                                   |
|----------------|-----------|------------------------------------------|
| `primary`      | `#3b5998` | górny pasek, linki, przyciski            |
| `light`        | `#d8dfea` | ramki, tła nagłówków sekcji, separatory  |
| `bg`           | `#ffffff` | tło strony i kart                        |
| `text`         | `#333333` | tekst                                    |

## Tailwind CSS

- Stylujemy wyłącznie klasami Tailwind CSS (v4). Bez osobnych plików CSS poza głównym z `@theme`.
- Paleta zdefiniowana raz w głównym CSS, domyślne kolory Tailwinda wyłączone:

```css
@import "tailwindcss";
@theme {
  --color-*: initial;
  --color-primary: #3b5998;
  --color-light: #d8dfea;
  --color-bg: #ffffff;
  --color-text: #333333;
  --font-sans: "lucida grande", tahoma, verdana, arial, sans-serif;
}
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
[data-theme=dark] {
  --color-primary: #6d84b4;
  --color-light: #3a3f4b;
  --color-bg: #1c1e21;
  --color-text: #e4e6eb;
}
```

- Tryb ciemny = te same 4 tokeny z innymi wartościami, przełączane `data-theme` na `<html>` (jasny / ciemny / systemowy z `prefers-color-scheme`, wybór zapisany w profilu). Nie używaj wariantu `dark:` do kolorów — tokeny zmieniają się same.

- Używaj `bg-primary`, `border-light`, `text-text` itd. Zakaz wartości arbitralnych (`bg-[#...]`, `text-[13px]`) i inline `style`.
- Powtarzający się zestaw klas → komponent, nie `@apply`.

Żadnych innych kolorów. Odcienie/przezroczystości tych czterech też nie — jeśli czegoś brakuje, zapytaj.

## Reguły

- Font: `font-sans` (z `@theme`), rozmiary `text-xs`/`text-sm`.
- Bez gradientów, cieni, zaokrągleń (max `rounded-xs`), animacji, ikonek-dekoracji. Emoji tylko w reakcjach.
- Wyjątek od „bez animacji”: przełączniki (switch) — gałka przesuwa się `transition-transform duration-150`, zawsze z `motion-reduce:transition-none`.
- Ramki `border border-light`.
- Przyciski tylko przez warianty z `src/components/button-styles.ts` (`button.primary`, `button.secondary`); przyciski-linki: `text-primary hover:underline`. Nie składaj klas przycisków ręcznie.
- Hover/aktywny/wyłączony = zamiana kolorów z palety (np. primary → odwrócenie `bg-bg text-primary`), nigdy `opacity-*`, cień ani `transition` (animacja tylko w przełącznikach, patrz wyżej).
- Fokus klawiatury: globalny `:focus-visible` w `globals.css` — nie usuwaj obwódki (`outline-none`) bez zamiennika.
- Układ desktop: górny pasek + wąska lewa kolumna nawigacji + główna kolumna treści, `max-w-[980px] mx-auto` (jedyny dozwolony wyjątek arbitralny).
- Mobile-first, wymagane: poniżej `md` lewa kolumna chowa się pod przycisk menu w górnym pasku, treść na pełną szerokość z `px-4`, brak poziomego scrolla. Cele dotyku min. `size-11`.
- Linki bez podkreślenia, podkreślenie na hover.
- Kursor: elementy interaktywne mają `cursor: pointer` z reguły w `@layer base` w `globals.css` — nie dopisuj `cursor-pointer` ręcznie. Nowy typ klikalnego elementu (np. `div` z `onClick`) → użyj `button` albo dopisz selektor do tej reguły.
- Semantyczny HTML i podstawy dostępności (label, alt, kontrast) — obowiązkowo.
- Żadnych tekstów wpisanych na sztywno w JSX — wszystko przez `t('klucz')` (patrz CLAUDE.md → i18n).
