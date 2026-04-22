import { NextResponse } from "next/server";

import { regenerateProjectOutput } from "@/lib/projects";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;

  try {
    const project = await regenerateProjectOutput(projectId);
    return NextResponse.json({ success: true, projectId: project.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to regenerate project preview.",
      },
      { status: 400 },
    );
  }
}
