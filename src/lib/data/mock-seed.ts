import type { ReactionType, Visibility } from "./types";
import type { db as Db } from "./mock-db";

// Generator ~200 rekordów na tabelę. Stałe ziarno → te same dane (i ID) po każdym restarcie.
export function seed(db: typeof Db, adminId: string) {
  let s = 20260925;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const int = (n: number) => Math.floor(rand() * n);
  const pick = <T,>(arr: readonly T[]) => arr[int(arr.length)];
  const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
  const minutes30d = () => 1 + int(60 * 24 * 30);
  const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

  const female = ["Anna", "Maria", "Zofia", "Julia", "Maja", "Lena", "Hanna", "Natalia", "Karolina", "Monika", "Agnieszka", "Ewa", "Magdalena", "Joanna", "Paulina", "Weronika"];
  const male = ["Jan", "Piotr", "Krzysztof", "Tomasz", "Paweł", "Michał", "Marcin", "Jakub", "Adam", "Łukasz", "Mateusz", "Kamil", "Bartosz", "Grzegorz", "Wojciech", "Filip"];
  const lastM = ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Krawczyk", "Piotrowski", "Grabowski"];
  const toF = (l: string) => l.replace(/ski$/, "ska").replace(/cki$/, "cka");
  const cities = ["Warszawa", "Kraków", "Gdańsk", "Wrocław", "Poznań", "Łódź", "Lublin", "Katowice", "Szczecin", "Białystok", "Rzeszów", "Toruń"];
  const schools = ["UW", "UJ", "Politechnika Gdańska", "AGH", "UAM", "SGH", "Politechnika Wrocławska", "Monogo", "Allegro", "CD Projekt", null];
  const visibilities: Visibility[] = ["public", "public", "friends", "friends", "family", "custom"];
  const reactions: ReactionType[] = ["like", "like", "like", "love", "haha", "wow", "sad"];
  const postBodies = [
    "Piękny dzień na spacer 🌞", "Ktoś poleci dobrą książkę?", "Właśnie wróciłem z wakacji!", "Kawa i praca zdalna ☕",
    "Szukam ekipy na planszówki w piątek", "Ale mecz wczoraj! ⚽", "Nowa praca od poniedziałku 🎉", "Upiekłam pierwszy chleb na zakwasie",
    "Polecam tę restaurację", "Czy tylko u mnie pada od tygodnia?", "Rocznica ślubu ❤️", "Kto idzie na koncert w sobotę?",
    "Przeprowadzka zakończona, zapraszam na parapetówkę", "Maraton ukończony! 42 km", "Zgubiłem klucze... znowu", "Wszystkiego najlepszego, mamo!",
  ];
  const commentBodies = ["Super!", "Zgadzam się 👍", "Haha, dobre", "Gratulacje!", "Też tak mam", "Kiedy?", "Chętnie dołączę", "Piękne!", "Trzymam kciuki", "O, nie wiedziałem"];
  const messageBodies = ["Cześć!", "Jak leci?", "Widzimy się jutro?", "Dzięki!", "Jasne, pasuje", "Zadzwonię wieczorem", "Wyślesz zdjęcia?", "Spóźnię się 10 min", "Haha 😂", "Do zobaczenia", "Masz chwilę?", "OK 👍"];
  const links = ["https://nextjs.org/blog", "https://supabase.com/blog", "https://tailwindcss.com/blog", "https://pl.wikipedia.org/wiki/Facebook", null, null, null, null];
  const groupNames = ["Biegacze", "Planszówki", "Fotografia", "Gotowanie", "Książki", "Rowery", "Góry", "Programiści", "Ogrodnicy", "Kino", "Muzyka", "Podróże", "Psiarze", "Kociarze", "Gry", "Rodzice"];

  // Użytkownicy: +200
  // Portrety z randomuser.me (100 kobiet, 100 mężczyzn) — płeć zgodna z imieniem.
  const portrait = (isF: boolean, n: number) => `https://randomuser.me/api/portraits/${isF ? "women" : "men"}/${n % 100}.jpg`;
  const counters = { f: 10, m: 10 }; // 0–9 zajęte przez ręcznych użytkowników z mock-db
  const ids: string[] = [];
  for (let i = 0; i < 200; i++) {
    const isF = rand() < 0.5;
    const id = uuid(100 + i);
    ids.push(id);
    const last = pick(lastM);
    db.profiles.push({
      id, public_id: "", email: `user${i + 1}@example.com`, first_name: pick(isF ? female : male), last_name: isF ? toF(last) : last,
      avatar_url: portrait(isF, isF ? counters.f++ : counters.m++), city: pick(cities), school: pick(schools), birthday: `19${70 + int(35)}-${String(1 + int(12)).padStart(2, "0")}-${String(1 + int(28)).padStart(2, "0")}`,
      about: rand() < 0.3 ? pick(["Lubię góry.", "Kawa > herbata.", "Fan planszówek.", "Pracuję w IT."]) : null,
      locale: "pl", theme: "system", profile_visibility: pick(visibilities), wall_visibility: pick(visibilities),
    });
  }

  // Publiczne ID: 8 losowych cyfr, unikalne (bez zera na początku — czytelniej w URL)
  const used = new Set<string>();
  for (const p of db.profiles) {
    let pid;
    do pid = String(10_000_000 + int(90_000_000)); while (used.has(pid));
    used.add(pid);
    p.public_id = pid;
  }

  // Znajomości: admin ma 40 znajomych + 8 zaproszeń, reszta losowo (~200). Bez duplikatów par.
  const pairs = new Set(db.friendships.map((f) => [f.requester_id, f.addressee_id].sort().join()));
  const befriend = (a: string, b: string, status: "accepted" | "pending") => {
    const key = [a, b].sort().join();
    if (a === b || pairs.has(key)) return;
    pairs.add(key);
    db.friendships.push({ requester_id: a, addressee_id: b, status, created_at: ago(minutes30d()) });
  };
  ids.slice(0, 40).forEach((id) => befriend(adminId, id, "accepted"));
  ids.slice(40, 48).forEach((id) => befriend(id, adminId, "pending"));
  while (db.friendships.length < 260) befriend(pick(ids), pick(ids), rand() < 0.9 ? "accepted" : "pending");
  ids.slice(0, 5).forEach((id) => db.familyMarks.push({ owner_id: adminId, member_id: id }, { owner_id: id, member_id: adminId }));
  db.profiles.filter((p) => p.wall_visibility === "custom").slice(0, 20).forEach((p) => db.visibilityAllow.push({ owner_id: p.id, viewer_id: adminId, scope: "wall" }));

  // Grupy: +200 (temat × miasto, admin w co czwartej), każda z czatem
  const groupIds: string[] = [];
  groupNames.flatMap((g) => cities.map((c) => `${g} ${c}`)).slice(0, 200).forEach((name, i) => {
    const id = `g-${i + 2}`;
    const owner = pick(ids);
    groupIds.push(id);
    db.groups.push({ id, name, description: `Grupa: ${name.toLowerCase()}.`, is_private: rand() < 0.3, owner_id: owner, conversation_id: `conv-${id}` });
    db.conversations.push({ id: `conv-${id}`, title: name, is_group: true, created_by: owner });
    const members = new Set([owner, ...Array.from({ length: 5 + int(15) }, () => pick(ids)), ...(i % 4 === 0 ? [adminId] : [])]);
    members.forEach((u) => {
      db.groupMembers.push({ group_id: id, user_id: u, role: u === owner ? "admin" : "member" });
      db.conversationMembers.push({ conversation_id: `conv-${id}`, user_id: u, last_read_at: ago(minutes30d()) });
    });
  });

  // Posty: +200 (na tablicach, z wzmiankami, linkami i w grupach)
  const authors = [adminId, ...ids];
  for (let i = 0; i < 200; i++) {
    const author = pick(authors);
    const inGroup = rand() < 0.15;
    const mention = rand() < 0.1 ? ` @[${pick(authors)}]` : "";
    db.posts.push({
      id: `p-${i + 10}`, author_id: author, wall_owner_id: inGroup ? null : rand() < 0.2 ? pick(authors) : author,
      group_id: inGroup ? pick(groupIds) : null, body: pick(postBodies) + mention, image_path: null, link_url: pick(links), created_at: ago(minutes30d()),
    });
  }

  // Komentarze: +200, reakcje: +200 (unikalne per użytkownik i cel)
  const postIds = db.posts.map((p) => p.id);
  for (let i = 0; i < 200; i++) {
    db.comments.push({ id: `c-${i + 10}`, parent_id: null, post_id: pick(postIds), author_id: pick(authors), body: pick(commentBodies), created_at: ago(minutes30d()) });
  }
  // Odpowiedzi: +60 w wątkach istniejących komentarzy głównych
  const roots = db.comments.filter((c) => !c.parent_id);
  for (let i = 0; i < 60; i++) {
    const root = pick(roots);
    db.comments.push({ id: `r-${i + 1}`, parent_id: root.id, post_id: root.post_id, author_id: pick(authors), body: pick(commentBodies), created_at: new Date(new Date(root.created_at).getTime() + (1 + int(600)) * 60_000).toISOString() });
  }
  const reacted = new Set(db.reactions.map((r) => `${r.user_id}:${r.target_type}:${r.target_id}`));
  for (let added = 0; added < 200; ) {
    const target_type = rand() < 0.8 ? "post" : "comment";
    const target_id = target_type === "post" ? pick(postIds) : pick(db.comments).id;
    const user_id = pick(authors);
    const key = `${user_id}:${target_type}:${target_id}`;
    if (reacted.has(key)) continue;
    reacted.add(key);
    db.reactions.push({ user_id, target_type, target_id, type: pick(reactions) });
    added++;
  }

  // Rozmowy 1:1: +60 z adminem (+200 czatów grup), wiadomości: +600
  const convIds: string[] = [];
  ids.slice(0, 60).forEach((other, i) => {
    const id = `conv-dm-${i + 1}`;
    convIds.push(id);
    db.conversations.push({ id, title: null, is_group: false, created_by: other });
    db.conversationMembers.push({ conversation_id: id, user_id: adminId, last_read_at: ago(60 * 24 * (i % 10)) }, { conversation_id: id, user_id: other, last_read_at: ago(1) });
  });
  const allConvs = [...convIds, ...groupIds.map((g) => `conv-${g}`)];
  for (let i = 0; i < 600; i++) {
    // 2/3 wiadomości w rozmowach admina, żeby jego czaty nie były puste
    const conversation_id = rand() < 0.66 ? pick(convIds) : pick(allConvs);
    const members = db.conversationMembers.filter((m) => m.conversation_id === conversation_id);
    db.messages.push({ id: `m-${i + 10}`, conversation_id, author_id: pick(members).user_id, body: pick(messageBodies), created_at: ago(minutes30d()) });
  }

  // Powiadomienia admina: +200
  const types = ["reaction", "comment", "mention", "wall_post", "friend_accept", "group_add"] as const;
  for (let i = 0; i < 200; i++) {
    const type = pick(types);
    const created = minutes30d();
    db.notifications.push({
      id: `n-${i + 10}`, user_id: adminId, actor_id: pick(ids), type,
      target_type: type === "friend_accept" ? "friendship" : type === "group_add" ? "group" : "post",
      target_id: type === "group_add" ? pick(groupIds) : type === "friend_accept" ? adminId : pick(postIds),
      read_at: created > 60 * 24 * 2 ? ago(created - 30) : null, created_at: ago(created),
    });
  }
}
