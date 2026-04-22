import { NextResponse } from "next/server";

import { createProject } from "@/lib/projects";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    enforceRateLimit(request.headers.get("x-forwarded-for") ?? "local-projects");

    const body = await request.json();
    await verifyTurnstileToken({
      token:
        typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
    });
    const project = await createProject(body);

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create project preview.",
      },
      { status: 400 },
    );
  }
}
