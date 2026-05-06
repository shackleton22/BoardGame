import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

import { getOptionalEnv } from "@/lib/env";

const ADMIN_COOKIE = "gamegift_admin";
const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function signAdminSession(issuedAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`gamegift-admin:${issuedAt}`)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function isAdminAuthenticated() {
  const expected = getOptionalEnv("ADMIN_PASSWORD");

  if (!expected) {
    return false;
  }

  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;

  if (!value) {
    return false;
  }

  const [issuedAtRaw, signature] = value.split(".");
  const issuedAt = Number(issuedAtRaw);

  if (!Number.isFinite(issuedAt) || !signature) {
    return false;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - issuedAt;

  if (ageSeconds < 0 || ageSeconds > ADMIN_COOKIE_MAX_AGE_SECONDS) {
    return false;
  }

  return safeEqual(signature, signAdminSession(issuedAt, expected));
}

export async function authenticateAdmin(password: string) {
  const expected = getOptionalEnv("ADMIN_PASSWORD");

  if (!expected || !safeEqual(password, expected)) {
    return false;
  }

  const store = await cookies();
  const issuedAt = Math.floor(Date.now() / 1000);

  store.set(ADMIN_COOKIE, `${issuedAt}.${signAdminSession(issuedAt, expected)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  });

  return true;
}
