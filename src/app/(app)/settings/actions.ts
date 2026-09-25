"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { updateSettings } from "@/lib/data/people";

const visibility = z.enum(["public", "friends", "family", "custom"]);
const schema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  profile_visibility: visibility,
  wall_visibility: visibility,
});

export async function saveSettings(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = schema.parse(Object.fromEntries(formData));
  await updateSettings(user.id, data);
  (await cookies()).set("theme", data.theme, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  redirect("/settings?saved=1");
}
