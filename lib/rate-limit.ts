const requestStore = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(key: string, max = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = requestStore.get(key);

  if (!current || current.resetAt < now) {
    requestStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= max) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  current.count += 1;
  requestStore.set(key, current);
}
