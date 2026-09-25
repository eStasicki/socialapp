import "server-only";
import { cookies } from "next/headers";
import { isMock } from "./env";
import { db, MOCK_PASSWORD } from "./data/mock-db";
import { createClient } from "./supabase/server";
import type { Profile } from "./data/types";

export const MOCK_SESSION_COOKIE = "mock_session";

export async function getCurrentUser(): Promise<Profile | null> {
  if (isMock) {
    const id = (await cookies()).get(MOCK_SESSION_COOKIE)?.value;
    return db.profiles.find((p) => p.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  return profile as Profile | null;
}

export async function signIn(email: string, password: string): Promise<boolean> {
  if (isMock) {
    const user = db.profiles.find((p) => p.email === email);
    if (!user || password !== MOCK_PASSWORD) return false;
    (await cookies()).set(MOCK_SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/" });
    return true;
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

export async function signOut() {
  if (isMock) {
    (await cookies()).delete(MOCK_SESSION_COOKIE);
    return;
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
}
