import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { getAppUrl, getOptionalEnv, hasReplitStorageConfig } from "@/lib/env";

const STORAGE_ROOT = "generated";

type ReplitClient = {
  init: (bucketId?: string) => Promise<unknown>;
  uploadFromBytes: (
    objectName: string,
    contents: Buffer,
  ) => Promise<{ ok: boolean; error?: unknown }>;
  downloadAsBytes: (
    objectName: string,
  ) => Promise<{ ok: boolean; value: Buffer; error?: unknown }>;
  exists: (objectName: string) => Promise<{ ok: boolean; value: boolean; error?: unknown }>;
};

let clientPromise: Promise<ReplitClient | null> | null = null;

async function getReplitClient() {
  if (!hasReplitStorageConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REPLIT_APP_STORAGE_BUCKET_ID is required in production.");
    }

    return null;
  }

  clientPromise ??= (async () => {
    try {
      const moduleName = "@replit/object-storage";
      const sdk = (await import(moduleName)) as { Client: new () => ReplitClient };
      const client = new sdk.Client();
      await client.init(getOptionalEnv("REPLIT_APP_STORAGE_BUCKET_ID"));
      return client;
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }

      console.error("Unable to initialize Replit App Storage client. Falling back to local storage.", error);
      return null;
    }
  })();

  return clientPromise;
}

export type StoredFile = {
  storageKey: string;
  publicUrl: string;
  localPath?: string;
};

export function buildStorageKey(projectId: string, fileName: string) {
  return `${STORAGE_ROOT}/${projectId}/${fileName}`;
}

export function buildSafeGeneratedStorageKeyFromSegments(segments: string[]) {
  const decodedSegments = segments.map((segment) => decodeURIComponent(segment));
  const storageKey = decodedSegments.join("/");

  if (
    !storageKey.startsWith(`${STORAGE_ROOT}/`) ||
    decodedSegments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\"),
    )
  ) {
    return null;
  }

  return storageKey;
}

export function buildStoragePublicUrl(storageKey: string) {
  const relativePath = `/api/files/${storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;

  return new URL(relativePath, getAppUrl()).toString();
}

async function ensureLocalProjectStorage(projectId: string) {
  const absoluteDir = path.join(process.cwd(), "public", STORAGE_ROOT, projectId);
  await mkdir(absoluteDir, { recursive: true });
  return absoluteDir;
}

function getLocalAbsolutePath(storageKey: string) {
  return path.join(process.cwd(), "public", ...storageKey.split("/"));
}

export async function storeGeneratedFile(args: {
  projectId: string;
  fileName: string;
  content: Buffer;
}) {
  const storageKey = buildStorageKey(args.projectId, args.fileName);
  const publicUrl = buildStoragePublicUrl(storageKey);
  const client = await getReplitClient();

  if (client) {
    const result = await client.uploadFromBytes(storageKey, args.content);
    if (!result.ok) {
      throw new Error("Failed to upload file to Replit App Storage.");
    }

    return {
      storageKey,
      publicUrl,
    } satisfies StoredFile;
  }

  const directory = await ensureLocalProjectStorage(args.projectId);
  const absolutePath = path.join(directory, args.fileName);
  await writeFile(absolutePath, args.content);

  return {
    storageKey,
    publicUrl,
    localPath: absolutePath,
  } satisfies StoredFile;
}

export async function readStoredFile(storageKey: string) {
  const client = await getReplitClient();

  if (client) {
    const result = await client.downloadAsBytes(storageKey);
    if (!result.ok) {
      throw new Error("Failed to read file from Replit App Storage.");
    }

    return result.value;
  }

  return readFile(getLocalAbsolutePath(storageKey));
}

export async function storedFileExists(storageKey: string) {
  const client = await getReplitClient();

  if (client) {
    const result = await client.exists(storageKey);
    return result.ok ? result.value : false;
  }

  try {
    await readFile(getLocalAbsolutePath(storageKey));
    return true;
  } catch {
    return false;
  }
}
