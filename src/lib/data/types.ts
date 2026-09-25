// Typy domenowe zgodne z modelem z .claude/rules/plan.md.
export type Visibility = "public" | "friends" | "family" | "custom";
export type ReactionType = "like" | "love" | "haha" | "wow" | "sad";

export type Profile = {
  id: string; // = auth.users.id (UUID), tylko wewnętrznie
  public_id: string; // 8 losowych cyfr — w adresach URL
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string | null;
  school: string | null;
  birthday: string | null;
  about: string | null;
  locale: "pl";
  theme: "light" | "dark" | "system";
  profile_visibility: Visibility;
  wall_visibility: Visibility;
};

export type VisibilityAllow = { owner_id: string; viewer_id: string; scope: "profile" | "wall" };
export type Block = { blocker_id: string; blocked_id: string };
export type Friendship = { requester_id: string; addressee_id: string; status: "pending" | "accepted"; created_at: string };
export type FamilyMark = { owner_id: string; member_id: string };
export type Post = {
  id: string;
  author_id: string;
  wall_owner_id: string | null;
  group_id: string | null;
  body: string;
  image_path: string | null;
  link_url: string | null;
  created_at: string;
};
// parent_id: odpowiedź w wątku (1 poziom — parent to zawsze komentarz główny)
export type Comment = { id: string; post_id: string; parent_id: string | null; author_id: string; body: string; created_at: string };
export type Reaction = { user_id: string; target_type: "post" | "comment"; target_id: string; type: ReactionType };
export type Group = { id: string; name: string; description: string; is_private: boolean; owner_id: string; conversation_id: string };
export type GroupMember = { group_id: string; user_id: string; role: "admin" | "member" };
export type Conversation = { id: string; title: string | null; is_group: boolean; created_by: string };
export type ConversationMember = { conversation_id: string; user_id: string; last_read_at: string | null };
export type Message = { id: string; conversation_id: string; author_id: string; body: string; created_at: string };
export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  type: "reaction" | "comment" | "reply" | "mention" | "wall_post" | "friend_request" | "friend_accept" | "group_add";
  target_type: "post" | "comment" | "friendship" | "group";
  target_id: string;
  read_at: string | null;
  created_at: string;
};
