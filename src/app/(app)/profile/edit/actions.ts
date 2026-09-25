"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { updateProfileInfo } from "@/lib/data/people";
import { profileHref } from "@/lib/format";

// Puste pole opcjonalne = null w bazie.
const optional = (max: number) => z.string().trim().max(max).transform((v) => v || null);
const today = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  first_name: z.string().trim().min(1).max(50),
  last_name: z.string().trim().min(1).max(50),
  city: optional(100),
  school: optional(100),
  birthday: z.union([z.literal("").transform(() => null), z.iso.date().refine((d) => d >= "1900-01-01" && d <= today())]),
  about: optional(500),
});

export async function saveProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/profile/edit?error=1");
  await updateProfileInfo(user.id, parsed.data);
  revalidatePath("/", "layout"); // imię w nagłówku, postach, komentarzach
  redirect(profileHref(user));
}
