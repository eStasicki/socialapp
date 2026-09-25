import "server-only";
import type {
  Comment, Conversation, ConversationMember, FamilyMark, Friendship, Group, GroupMember,
  Message, Notification, Post, Profile, Reaction, VisibilityAllow, Block,
} from "./types";
import { seed } from "./mock-seed";

// Dane mockowe dla `pnpm dev` bez Supabase. Trzymane w pamięci procesu — reset przy restarcie serwera.
export const MOCK_PASSWORD = "admin";

// Stałe UUID — takie same identyfikatory jak auth.users.id w Supabase.
export const U = {
  admin: "00000000-0000-4000-8000-000000000001",
  anna: "00000000-0000-4000-8000-000000000002",
  piotr: "00000000-0000-4000-8000-000000000003",
  kasia: "00000000-0000-4000-8000-000000000004",
  tomek: "00000000-0000-4000-8000-000000000005",
  ola: "00000000-0000-4000-8000-000000000006",
};

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const profile = (id: string, email: string, first_name: string, last_name: string, extra: Partial<Profile> = {}): Profile => ({
  id, public_id: "", email, first_name, last_name, avatar_url: null, city: null, school: null, birthday: null, about: null,
  locale: "pl", theme: "system", profile_visibility: "public", wall_visibility: "friends", ...extra,
});

export const db = {
  profiles: [
    profile(U.admin, "admin@admin.com", "Admin", "Adminowski", { avatar_url: "https://randomuser.me/api/portraits/men/1.jpg", city: "Warszawa", school: "Politechnika Warszawska", birthday: "1990-05-12", about: "Administrator portalu." }),
    profile(U.anna, "anna@example.com", "Anna", "Kowalska", { avatar_url: "https://randomuser.me/api/portraits/women/1.jpg", city: "Kraków", school: "UJ" }),
    profile(U.piotr, "piotr@example.com", "Piotr", "Nowak", { avatar_url: "https://randomuser.me/api/portraits/men/2.jpg", city: "Gdańsk", wall_visibility: "public" }),
    profile(U.kasia, "kasia@example.com", "Katarzyna", "Wiśniewska", { avatar_url: "https://randomuser.me/api/portraits/women/2.jpg", city: "Wrocław", profile_visibility: "friends", wall_visibility: "custom" }),
    profile(U.tomek, "tomek@example.com", "Tomasz", "Adminowski", { avatar_url: "https://randomuser.me/api/portraits/men/3.jpg", city: "Warszawa", wall_visibility: "family" }),
    profile(U.ola, "ola@example.com", "Aleksandra", "Zielińska", { avatar_url: "https://randomuser.me/api/portraits/women/3.jpg", city: "Poznań" }),
  ],
  friendships: [
    { requester_id: U.admin, addressee_id: U.anna, status: "accepted", created_at: ago(60 * 24 * 30) },
    { requester_id: U.piotr, addressee_id: U.admin, status: "accepted", created_at: ago(60 * 24 * 20) },
    { requester_id: U.admin, addressee_id: U.tomek, status: "accepted", created_at: ago(60 * 24 * 90) },
    { requester_id: U.kasia, addressee_id: U.admin, status: "accepted", created_at: ago(60 * 24 * 5) },
    { requester_id: U.ola, addressee_id: U.admin, status: "pending", created_at: ago(90) },
    { requester_id: U.anna, addressee_id: U.piotr, status: "accepted", created_at: ago(60 * 24 * 10) },
  ] as Friendship[],
  visibilityAllow: [
    { owner_id: U.kasia, viewer_id: U.admin, scope: "wall" },
  ] as VisibilityAllow[],
  blocks: [] as Block[],
  familyMarks: [
    { owner_id: U.admin, member_id: U.tomek },
    { owner_id: U.tomek, member_id: U.admin },
  ] as FamilyMark[],
  posts: [
    { id: "p1", author_id: U.anna, wall_owner_id: U.anna, group_id: null, body: "Pierwszy dzień wiosny w Krakowie! 🌸", image_path: null, link_url: null, created_at: ago(15) },
    { id: "p2", author_id: U.piotr, wall_owner_id: U.admin, group_id: null, body: `Hej @[${U.admin}], widzimy się w sobotę?`, image_path: null, link_url: null, created_at: ago(60) },
    { id: "p3", author_id: U.admin, wall_owner_id: U.admin, group_id: null, body: "Witajcie w socialapp! Piszcie, co działa, a co nie.", image_path: null, link_url: null, created_at: ago(60 * 5) },
    { id: "p4", author_id: U.kasia, wall_owner_id: U.kasia, group_id: null, body: "Polecam ten artykuł", image_path: null, link_url: "https://nextjs.org/blog", created_at: ago(60 * 26) },
    { id: "p5", author_id: U.tomek, wall_owner_id: null, group_id: "g1", body: "Kto w tym roku organizuje wigilię?", image_path: null, link_url: null, created_at: ago(60 * 48) },
    { id: "p6", author_id: U.ola, wall_owner_id: U.ola, group_id: null, body: "Szukam współlokatora w Poznaniu, ktoś coś?", image_path: null, link_url: null, created_at: ago(30) },
  ] as Post[],
  comments: [
    { id: "c1", parent_id: null, post_id: "p1", author_id: U.admin, body: "Piękne zdjęcia!", created_at: ago(10) },
    { id: "c2", parent_id: null, post_id: "p1", author_id: U.piotr, body: "Zazdroszczę pogody 😄", created_at: ago(5) },
    { id: "c3", parent_id: null, post_id: "p2", author_id: U.admin, body: "Jasne, będę o 18.", created_at: ago(45) },
    { id: "c4", parent_id: null, post_id: "p5", author_id: U.admin, body: "Może u nas?", created_at: ago(60 * 40) },
    { id: "c5", parent_id: "c1", post_id: "p1", author_id: U.anna, body: "Dzięki! 😊", created_at: ago(8) },
    { id: "c6", parent_id: "c1", post_id: "p1", author_id: U.kasia, body: "@Anna Kowalska też chcę tam jechać", created_at: ago(4) },
    { id: "c7", parent_id: "c4", post_id: "p5", author_id: U.tomek, body: "Super pomysł, zapraszamy wszystkich", created_at: ago(60 * 38) },
  ] as Comment[],
  reactions: [
    { user_id: U.admin, target_type: "post", target_id: "p1", type: "love" },
    { user_id: U.piotr, target_type: "post", target_id: "p1", type: "like" },
    { user_id: U.kasia, target_type: "post", target_id: "p1", type: "like" },
    { user_id: U.anna, target_type: "post", target_id: "p3", type: "haha" },
    { user_id: U.tomek, target_type: "post", target_id: "p3", type: "like" },
    { user_id: U.anna, target_type: "comment", target_id: "c1", type: "like" },
  ] as Reaction[],
  groups: [
    { id: "g1", name: "Rodzina Adminowskich", description: "Sprawy rodzinne.", is_private: true, owner_id: U.tomek, conversation_id: "conv-g1" },
  ] as Group[],
  groupMembers: [
    { group_id: "g1", user_id: U.tomek, role: "admin" },
    { group_id: "g1", user_id: U.admin, role: "member" },
  ] as GroupMember[],
  conversations: [
    { id: "conv-1", title: null, is_group: false, created_by: U.anna },
    { id: "conv-2", title: "Sobotnia ekipa", is_group: true, created_by: U.piotr },
    { id: "conv-g1", title: "Rodzina Adminowskich", is_group: true, created_by: U.tomek },
  ] as Conversation[],
  conversationMembers: [
    { conversation_id: "conv-1", user_id: U.admin, last_read_at: ago(20) },
    { conversation_id: "conv-1", user_id: U.anna, last_read_at: ago(2) },
    { conversation_id: "conv-2", user_id: U.admin, last_read_at: ago(60 * 3) },
    { conversation_id: "conv-2", user_id: U.piotr, last_read_at: ago(1) },
    { conversation_id: "conv-2", user_id: U.kasia, last_read_at: ago(30) },
    { conversation_id: "conv-g1", user_id: U.tomek, last_read_at: ago(60) },
    { conversation_id: "conv-g1", user_id: U.admin, last_read_at: ago(60) },
  ] as ConversationMember[],
  messages: [
    { id: "m1", conversation_id: "conv-1", author_id: U.anna, body: "Cześć! Jak leci?", created_at: ago(30) },
    { id: "m2", conversation_id: "conv-1", author_id: U.admin, body: "Dobrze, a u Ciebie?", created_at: ago(25) },
    { id: "m3", conversation_id: "conv-1", author_id: U.anna, body: "Super, wrzuciłam zdjęcia z Krakowa 🙂", created_at: ago(3) },
    { id: "m4", conversation_id: "conv-2", author_id: U.piotr, body: "Sobota 18:00, pasuje wszystkim?", created_at: ago(60 * 4) },
    { id: "m5", conversation_id: "conv-2", author_id: U.kasia, body: "Pasuje!", created_at: ago(60 * 2) },
    { id: "m6", conversation_id: "conv-2", author_id: U.piotr, body: `@[${U.admin}] a Ty?`, created_at: ago(60) },
    { id: "m7", conversation_id: "conv-g1", author_id: U.tomek, body: "Pamiętajcie o urodzinach babci.", created_at: ago(60 * 2) },
  ] as Message[],
  notifications: [
    { id: "n1", user_id: U.admin, actor_id: U.piotr, type: "wall_post", target_type: "post", target_id: "p2", read_at: null, created_at: ago(60) },
    { id: "n2", user_id: U.admin, actor_id: U.piotr, type: "mention", target_type: "post", target_id: "p2", read_at: null, created_at: ago(60) },
    { id: "n3", user_id: U.admin, actor_id: U.ola, type: "friend_request", target_type: "friendship", target_id: U.ola, read_at: null, created_at: ago(90) },
    { id: "n4", user_id: U.admin, actor_id: U.anna, type: "reaction", target_type: "post", target_id: "p3", read_at: ago(60 * 3), created_at: ago(60 * 4) },
  ] as Notification[],
};

seed(db, U.admin);
