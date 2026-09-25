"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/lib/auth";

const schema = z.object({ email: z.email(), password: z.string().min(1) });

export async function login(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !(await signIn(parsed.data.email, parsed.data.password))) redirect("/login?error=1");
  redirect("/");
}
