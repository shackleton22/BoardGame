import { getTurnstileSecretKey } from "@/lib/env";

export async function verifyTurnstileToken(args: {
  token?: string;
  ip?: string;
}) {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    return true;
  }

  if (!args.token) {
    throw new Error("Please complete the verification challenge and try again.");
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: args.token,
      remoteip: args.ip ?? "",
    }),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };

  if (!payload.success) {
    throw new Error("Verification failed. Please refresh the page and try again.");
  }

  return true;
}
