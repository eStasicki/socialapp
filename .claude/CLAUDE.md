# SocialApp

Portal społecznościowy w stylu wczesnego Facebooka (ok. 2004–2006), działający na żywo. Zakres i etapy: @rules/plan.md

## Zasady ogólne

- Prostota ponad wszystko. Najpierw funkcja, potem wygląd, nigdy ozdobniki.
- Nie dodawaj zależności bez pytania. Natywny HTML/CSS przed bibliotekami.
- Żadnych abstrakcji "na zapas" — budujemy tylko to, o co poproszono.

## Stack

- **Next.js (App Router) + TypeScript** — jedna aplikacja: UI, logika i API. Mutacje przez Server Actions, bez osobnego backendu i bez REST „na zapas”.
- **Tailwind CSS v4** — jedyny sposób stylowania (patrz @rules/ui.md).
- **Supabase** — Postgres + Auth + Storage (zdjęcia) w jednym.
  - Dostęp przez `@supabase/supabase-js` + `@supabase/ssr` (sesja w cookies, odświeżana w `src/proxy.ts` — w Next 16 middleware nazywa się proxy). Klienty: `@/lib/supabase/server` i `@/lib/supabase/client`. Bez dodatkowego ORM.
  - Typy generowane: `supabase gen types typescript` → `src/types/database.ts`. Nie pisz typów tabel ręcznie.
  - Schemat tylko przez migracje SQL w `supabase/migrations/` (Supabase CLI), nigdy klikane w panelu.
  - RLS włączone na każdej tabeli, z politykami w tej samej migracji. Klucz `service_role` nigdy w kodzie klienckim.
  - Logowanie: Supabase Auth (email + hasło).
- **Zod** — walidacja wejścia w każdej Server Action.
- **pnpm** — menedżer pakietów.

Poza stackiem nie dodajemy nic bez pytania (bez Reduxa, bez bibliotek UI, bez GraphQL). Stan po stronie klienta: React + URL.

## Tryb DEV (mock)

- `DEV_MODE=true` w `.env.local` → dane z `src/lib/data/mock-db.ts` zamiast Supabase (flaga `isMock` z `src/lib/env.ts`). W buildzie produkcyjnym zawsze wyłączony.
- Konto mockowe: `admin@admin.com` / `admin`.
- Strony nie wołają Supabase bezpośrednio — tylko przez funkcje w `src/lib/auth.ts` i `src/lib/data/*`, które obsługują obie gałęzie (mock i Supabase).
- Nowa tabela w migracji = nowe dane w `mock-db.ts` i typ w `src/lib/data/types.ts`.

## i18n

- Teksty UI tylko w `messages/<locale>.json` (na start `pl.json`), zagnieżdżone klucze wg widoku: `profile.edit.save`.
- Własny mały helper `t()` (serwer + klient) na słowniku JSON; typy kluczy z `pl.json`, brak klucza = błąd TS.
- Liczba mnoga, daty, liczby: natywne `Intl.PluralRules`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`.
- Język z `profiles.locale`, bez prefiksu w URL. Nowy język = nowy plik JSON, zero zmian w kodzie.
- ponytail: własny helper; przejść na `next-intl`, gdy potrzebne będzie ICU/URL per język.

## UI

Szczegóły: @rules/ui.md
