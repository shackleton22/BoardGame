import { buildFallbackMysteryNight } from "@/lib/ai/fallbackMysteryNight";
import { captureServerError } from "@/lib/monitoring";
import { requestStructuredJson } from "@/lib/ai/openai";
import {
  buildMysteryNightPrompt,
  GENERIC_GAME_JSON_SCHEMA,
  MYSTERY_NIGHT_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  generatedGameOutputSchema,
  type MysteryNightWizardInput,
  type ProjectOutputPayload,
} from "@/lib/validation/project";

export async function generateMysteryNightContent(
  input: MysteryNightWizardInput,
): Promise<{ output: ProjectOutputPayload; source: "ai" | "fallback" }> {
  try {
    const raw = await requestStructuredJson({
      systemPrompt: MYSTERY_NIGHT_SYSTEM_PROMPT,
      userPrompt: buildMysteryNightPrompt(input),
      schemaName: "mystery_night_output",
      schema: GENERIC_GAME_JSON_SCHEMA,
    });

    if (!raw) {
      return { output: buildFallbackMysteryNight(input), source: "fallback" };
    }

    return {
      output: generatedGameOutputSchema.parse(raw),
      source: "ai",
    };
  } catch (error) {
    await captureServerError(error, { template: "case-file", stage: "generate" });
    return { output: buildFallbackMysteryNight(input), source: "fallback" };
  }
}
