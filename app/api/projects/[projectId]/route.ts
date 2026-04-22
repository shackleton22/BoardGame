import { NextResponse } from "next/server";

import { updateProjectOutput } from "@/lib/projects";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;

  try {
    const body = await request.json();
    const project = await updateProjectOutput(projectId, body);

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save project changes.",
      },
      { status: 400 },
    );
  }
}
