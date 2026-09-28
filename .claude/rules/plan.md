# Plan aplikacji (MVP)

Portal dla znajomych w klimacie wczesnego Facebooka, działający na żywo (Supabase Realtime).
Każdy etap kończy się działającą, klikalną aplikacją. Realtime robimy od razu w danym etapie, nie na końcu.

## Funkcje

**Konto i ustawienia**
- Rejestracja (imię, nazwisko, email, hasło), logowanie, wylogowanie, reset hasła — Supabase Auth.
- Bez sesji dostępne tylko `/login`, `/register`.
- Ustawienia: prywatność, język, motyw (jasny / ciemny / systemowy), lista zablokowanych.
- Eksport danych (JSON do pobrania) i usunięcie konta (kaskadowo) — RODO.

**Profil**
- Avatar, imię i nazwisko, info (miasto, szkoła/praca, urodziny, „O mnie”), znajomi (6 miniatur), tablica.

**Prywatność (per użytkownik, osobno dla profilu i tablicy)**
- `public` — wszyscy zalogowani, `friends` — znajomi, `family` — osoby oznaczone jako rodzina,
  `custom` — wybrane osoby (lista checkboxów ze znajomych).
- „Rodzina” to oznaczenie, które właściciel nadaje swoim znajomym (jednostronne).
- Egzekwowane w RLS jedną funkcją SQL `can_view(owner, viewer, scope)`. Nigdy tylko w UI.

**Znajomi**
- Zaproszenie → akceptacja / odrzucenie; usunięcie znajomego; oznaczenie jako rodzina.
- Wskaźnik „dostępny” (Supabase Presence) przy znajomych i na czacie.

**Posty i tablica**
- Tekst + opcjonalnie jedno zdjęcie (Storage) + podgląd linku.
- Post na własnej tablicy lub na tablicy znajomego (jeśli jego ustawienia pozwalają).
- Usuwa autor lub właściciel tablicy.

**Reakcje**
- 👍 Lubię to, ❤️, 😂, 😮, 😢 — jedna reakcja na osobę na post/komentarz, zmiana nadpisuje.
- Pod postem liczniki per typ i lista „kto zareagował”.

**Komentarze**
- Wątki 1 poziom („Odpowiedz” → odpowiedź pod komentarzem głównym z @imieniem), z reakcjami i wzmiankami. Usuwa autor komentarza lub autor posta.

**Wzmianki `@imię`**
- Autouzupełnianie ze znajomych przy pisaniu posta/komentarza/wiadomości.
- Zapis jako `@[user_id]` w treści, render jako link do profilu, powiadomienie dla oznaczonego.

**Podgląd linków**
- Pierwszy URL w poście → Server Action pobiera `og:title`, `og:description`, `og:image`; zapis w `link_previews` (cache po URL).
- Ochrona przed SSRF: tylko `http(s)`, blokada adresów prywatnych/localhost, timeout 3s, limit rozmiaru odpowiedzi.

**Wiadomości i grupy**
- Rozmowy 1:1 i grupowe w jednym modelu (`conversations` + uczestnicy).
- Rozmowa grupowa: nazwa, dodawanie/usuwanie uczestników (twórca), wyjście z grupy.
- Na żywo: nowe wiadomości, „pisze…” (Broadcast), „przeczytane” (`last_read_at` uczestnika).
- Licznik nieprzeczytanych w górnym pasku.

**Grupy (społeczności)**
- Grupa: nazwa, opis, publiczna / prywatna, członkowie, admin (twórca).
- Tablica grupy z postami (te same posty, reakcje, komentarze). Każda grupa ma swój czat grupowy.

**Powiadomienia (dzwonek, na żywo)**
- Reakcja, komentarz, wzmianka, post na mojej tablicy, zaproszenie / akceptacja, dodanie do grupy.
- Tworzone triggerami SQL, nie w kodzie aplikacji. Licznik nieprzeczytanych + „oznacz jako przeczytane”.

**Bezpieczeństwo**
- Blokowanie: obie strony przestają się widzieć wszędzie (RLS przez `is_blocked(a, b)`).
- Zgłaszanie posta / komentarza / użytkownika (powód + opis) do tabeli `reports`. Panel moderacji — poza MVP.

**Aktualności `/`**
- Chronologicznie: posty moje, znajomych i z moich grup; 20 na stronę, „Starsze”. Bez algorytmu.

**Wyszukiwarka** — osoby i grupy po nazwie.

## Widoki

| Ścieżka | Zawartość |
|---|---|
| `/login`, `/register`, `/reset` | autoryzacja |
| `/` | aktualności + nowy post |
| `/profile/[public_id]` | profil, znajomi, tablica (puste sekcje ukryte) |
| `/profile/edit` | edycja profilu |
| `/friends` | znajomi, zaproszenia, oznaczenie rodziny |
| `/messages`, `/messages/[id]` | lista rozmów, rozmowa |
| `/groups`, `/groups/[id]` | moje grupy, tablica grupy |
| `/notifications` | wszystkie powiadomienia |
| `/search?q=` | wyniki |
| `/settings` | prywatność, język, motyw, blokady, eksport, usunięcie konta |

## Model danych (Supabase)

```
profiles           id (= auth.users.id, UUID — tylko wewnętrznie), public_id (8 losowych cyfr, unique — w URL), first_name, last_name, avatar_url, city, school,
                   birthday, about, locale, theme, profile_visibility, wall_visibility
visibility_allow   owner_id, viewer_id, scope (profile|wall)          -- dla `custom`
friendships        requester_id, addressee_id, status (pending|accepted), created_at
family_marks       owner_id, member_id                                -- „rodzina” wg właściciela
blocks             blocker_id, blocked_id
posts              id, author_id, wall_owner_id?, group_id?, body, image_path?, link_url?, created_at
link_previews      url (PK), title, description, image_url, fetched_at
comments           id, post_id, parent_id? (wątek 1 poziom), author_id, body, created_at
reactions          user_id, target_type (post|comment), target_id, type (like|love|haha|wow|sad)
                   PK (user_id, target_type, target_id)
mentions           source_type, source_id, mentioned_id
groups             id, name, description, is_private, owner_id, conversation_id
group_members      group_id, user_id, role (admin|member)
conversations      id, title?, is_group, created_by
conversation_members conversation_id, user_id, last_read_at
messages           id, conversation_id, author_id, body, created_at
notifications      id, user_id, actor_id, type, target_type, target_id, read_at, created_at
reports            id, reporter_id, target_type, target_id, reason, details, created_at
```

- `profiles` tworzone triggerem na `auth.users`.
- Storage: `avatars/{user_id}/…`, `post-images/{user_id}/…` — polityki Storage jak RLS.
- Funkcje SQL używane w RLS: `are_friends`, `is_family`, `is_blocked`, `can_view`, `is_member`.

## Realtime

- Pierwszy render na serwerze (Server Components), potem mały komponent kliencki subskrybuje zmiany.
- `postgres_changes`: `posts`, `comments`, `reactions`, `messages`, `notifications`, `friendships` — RLS filtruje zdarzenia.
- Presence: „dostępny”. Broadcast: „pisze…”.
- Własne akcje natychmiast przez `useOptimistic`.
- ponytail: feed filtrowany w kliencie; przy dużym ruchu → Broadcast z triggerów per użytkownik.

## Etapy

1. Szkielet: Next.js, Tailwind (`@theme`, jasny/ciemny), i18n, Supabase CLI, layout responsywny.
2. Auth + `profiles` + ochrona tras + ustawienia (język, motyw).
3. Profil: podgląd, edycja, avatar.
4. Znajomi + rodzina + blokady + Presence.
5. Prywatność (`can_view`, `visibility_allow`).
6. Posty + tablica + zdjęcia + podgląd linków (realtime).
7. Komentarze + reakcje (realtime).
8. Wzmianki + powiadomienia (dzwonek, realtime).
9. Wiadomości 1:1 i grupowe, „pisze…”, „przeczytane”.
10. Grupy (tablica + czat grupy).
11. Aktualności ze stronicowaniem + wyszukiwarka.
12. Zgłoszenia, eksport i usunięcie konta.

## Poza MVP

Relacje 24h, PWA + push, panel moderacji, 2FA/passkeys, algorytm feedu, wideo, funkcje AI.
