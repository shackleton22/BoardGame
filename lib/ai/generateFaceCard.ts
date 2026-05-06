import { buildFallbackFaceCard } from "@/lib/ai/fallbackFaceCard";
import { requestStructuredJson } from "@/lib/ai/openai";
import {
  buildFaceCardPrompt,
  FACE_CARD_SYSTEM_PROMPT,
  GENERIC_GAME_JSON_SCHEMA,
} from "@/lib/ai/prompts";
import { captureServerError } from "@/lib/monitoring";
import {
  generatedGameOutputSchema,
  type FaceCardWizardInput,
  type ProjectOutputPayload,
} from "@/lib/validation/project";

export async function generateFaceCardContent(
  input: FaceCardWizardInput,
): Promise<{ output: ProjectOutputPayload; source: "ai" | "fallback" }> {
  try {
    const raw = await requestStructuredJson({
      systemPrompt: FACE_CARD_SYSTEM_PROMPT,
      userPrompt: buildFaceCardPrompt(input),
      schemaName: "face_card_output",
      schema: GENERIC_GAME_JSON_SCHEMA,
    });

    if (!raw) {
      return { output: buildFallbackFaceCard(input), source: "fallback" };
    }

    return {
      output: generatedGameOutputSchema.parse(raw),
      source: "ai",
    };
  } catch (error) {
    await captureServerError(error, { template: "face-card", stage: "generate" });
    return { output: buildFallbackFaceCard(input), source: "fallback" };
  }
}
