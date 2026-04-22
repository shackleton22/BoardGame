import { getSentryDsn } from "@/lib/env";

function parseSentryDsn(dsn: string) {
  const url = new URL(dsn);
  const projectId = url.pathname.replace("/", "");

  if (!projectId || !url.username) {
    return null;
  }

  return {
    storeUrl: `${url.protocol}//${url.host}/api/${projectId}/store/`,
    publicKey: url.username,
  };
}

export async function captureServerError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  console.error(error);

  const dsn = getSentryDsn();

  if (!dsn) {
    return;
  }

  const parsed = parseSentryDsn(dsn);

  if (!parsed) {
    return;
  }

  try {
    await fetch(parsed.storeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=gamegiftstudio/0.1`,
      },
      body: JSON.stringify({
        message: error instanceof Error ? error.message : "Unknown server error",
        level: "error",
        platform: "javascript",
        extra: context,
      }),
    });
  } catch (reportError) {
    console.error("Unable to report error to Sentry.", reportError);
  }
}
