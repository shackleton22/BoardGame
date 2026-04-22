import { NextResponse } from "next/server";

import { generateLifeQuestAiContent } from "@/lib/ai/generateLifeQuest";
import { lifeQuestWizardSchema } from "@/lib/validation/project";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = lifeQuestWizardSchema.parse(await request.json());
    const result = await generateLifeQuestAiContent(input);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to generate Life Quest content.",
      },
      { status: 400 },
    );
  }
}
