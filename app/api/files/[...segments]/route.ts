import { NextResponse } from "next/server";

import { readStoredFile } from "@/lib/storage";
import { guessMimeType } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await context.params;
  const storageKey = segments.map((segment) => decodeURIComponent(segment)).join("/");

  try {
    const bytes = await readStoredFile(storageKey);
    const fileName = segments[segments.length - 1] ?? "file";

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": guessMimeType(fileName),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "File not found.",
      },
      { status: 404 },
    );
  }
}
