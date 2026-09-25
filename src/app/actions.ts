"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, signOut } from "@/lib/auth";
import { updateTheme } from "@/lib/data/people";

export async function logout() {
  await signOut();
  redirect("/login");
}

// Przełącznik w headerze: DOM zmienia się od razu po stronie klienta, tu tylko zapis wyboru.
export async function saveTheme(theme: string) {
  const parsed = z.enum(["light", "dark"]).parse(theme);
  (await cookies()).set("theme", parsed, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  const user = await getCurrentUser();
  if (user) await updateTheme(user.id, parsed);
}
