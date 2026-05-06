import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function sanitizePlainText(value: string, maxLength = 180) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeHtml(value: string) {
  return escapeXml(value);
}

export function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export function pick<T>(value: T | null | undefined, fallback: T) {
  return value ?? fallback;
}

export function pickInt(value: string | number | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }

  return fallback;
}

export function dollarsToCents(value: string | number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.round(parsed * 100);
}

export function startOfFutureHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function addBusinessDays(date: Date, businessDays: number) {
  const next = new Date(date);
  let remaining = businessDays;

  while (remaining > 0) {
    next.setDate(next.getDate() + 1);
    const day = next.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return next;
}

export function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return null;
  }

  const actualDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(actualDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(actualDate);
}

export function buildPublicOrderNumber(seed = Date.now()) {
  const dayPart = new Date(seed).toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor((seed % 100000) + Math.random() * 90000)
    .toString()
    .padStart(5, "0");
  return `GGS-${dayPart}-${randomPart}`;
}

export function guessMimeType(fileName: string) {
  if (fileName.endsWith(".png")) {
    return "image/png";
  }
  if (fileName.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (fileName.endsWith(".json")) {
    return "application/json";
  }
  return "application/pdf";
}
