import { DEFAULT_SUPPORT_EMAIL } from "@/lib/constants";

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

export function getAppUrl() {
  return getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
}

export function getSupportEmail() {
  return getOptionalEnv("SUPPORT_EMAIL") ?? DEFAULT_SUPPORT_EMAIL;
}

export function hasOpenAIConfig() {
  return Boolean(getOptionalEnv("OPENAI_API_KEY"));
}

export function hasStripeConfig() {
  return Boolean(
    getOptionalEnv("STRIPE_SECRET_KEY") &&
      getOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  );
}

export function hasReplitStorageConfig() {
  return Boolean(getOptionalEnv("REPLIT_APP_STORAGE_BUCKET_ID"));
}

export function hasTheGameCrafterConfig() {
  return Boolean(
    getOptionalEnv("TGC_API_KEY_ID") &&
      getOptionalEnv("TGC_USERNAME") &&
      getOptionalEnv("TGC_PASSWORD"),
  );
}

export function getOpenAITextModel() {
  return getOptionalEnv("OPENAI_TEXT_MODEL") ?? "gpt-5-mini";
}

export function getOpenAIImageModel() {
  return getOptionalEnv("OPENAI_IMAGE_MODEL") ?? "gpt-image-2";
}

export function getTgcPaymentMethod() {
  return getOptionalEnv("TGC_PAYMENT_METHOD") ?? "shopcredit";
}

export function getCronSecret() {
  return getOptionalEnv("CRON_SECRET");
}

export function getPostHogPublicKey() {
  return getOptionalEnv("NEXT_PUBLIC_POSTHOG_KEY");
}

export function getPostHogHost() {
  return getOptionalEnv("NEXT_PUBLIC_POSTHOG_HOST") ?? "https://us.i.posthog.com";
}

export function getTurnstileSiteKey() {
  return getOptionalEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
}

export function getTurnstileSecretKey() {
  return getOptionalEnv("TURNSTILE_SECRET_KEY");
}

export function hasTurnstileConfig() {
  return Boolean(getTurnstileSiteKey() && getTurnstileSecretKey());
}

export function getResendApiKey() {
  return getOptionalEnv("RESEND_API_KEY");
}

export function getEmailFromAddress() {
  return getOptionalEnv("EMAIL_FROM");
}

export function getSentryDsn() {
  return getOptionalEnv("SENTRY_DSN") ?? getOptionalEnv("NEXT_PUBLIC_SENTRY_DSN");
}
