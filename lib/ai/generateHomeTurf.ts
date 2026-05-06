import { buildFallbackHomeTurf } from "@/lib/ai/fallbackHomeTurf";
import { requestStructuredJson } from "@/lib/ai/openai";
import {
  buildHomeTurfPrompt,
  GENERIC_GAME_JSON_SCHEMA,
  HOME_TURF_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { captureServerError } from "@/lib/monitoring";
import {
  generatedGameOutputSchema,
  type HomeTurfWizardInput,
  type ProjectOutputPayload,
} from "@/lib/validation/project";

export async function generateHomeTurfContent(
  input: HomeTurfWizardInput,
): Promise<{ output: ProjectOutputPayload; source: "ai" | "fallback" }> {
  try {
    const raw = await requestStructuredJson({
      systemPrompt: HOME_TURF_SYSTEM_PROMPT,
      userPrompt: buildHomeTurfPrompt(input),
      schemaName: "home_turf_output",
      schema: GENERIC_GAME_JSON_SCHEMA,
    });

    if (!raw) {
      return { output: buildFallbackHomeTurf(input), source: "fallback" };
    }

    return {
      output: generatedGameOutputSchema.parse(raw),
      source: "ai",
    };
  } catch (error) {
    await captureServerError(error, { template: "home-turf", stage: "generate" });
    return { output: buildFallbackHomeTurf(input), source: "fallback" };
  }
}
