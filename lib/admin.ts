import { cookies } from "next/headers";

import { getOptionalEnv } from "@/lib/env";

const ADMIN_COOKIE = "gamegift_admin";

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function authenticateAdmin(password: string) {
  const expected = getOptionalEnv("ADMIN_PASSWORD");

  if (!expected || password !== expected) {
    return false;
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });

  return true;
}
