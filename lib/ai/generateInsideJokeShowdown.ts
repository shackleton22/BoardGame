import { buildFallbackInsideJokeShowdown } from "@/lib/ai/fallbackInsideJokeShowdown";
import { captureServerError } from "@/lib/monitoring";
import { requestStructuredJson } from "@/lib/ai/openai";
import {
  buildInsideJokePrompt,
  GENERIC_GAME_JSON_SCHEMA,
  INSIDE_JOKE_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  generatedGameOutputSchema,
  type InsideJokeShowdownWizardInput,
  type ProjectOutputPayload,
} from "@/lib/validation/project";

export async function generateInsideJokeShowdownContent(
  input: InsideJokeShowdownWizardInput,
): Promise<{ output: ProjectOutputPayload; source: "ai" | "fallback" }> {
  try {
    const raw = await requestStructuredJson({
      systemPrompt: INSIDE_JOKE_SYSTEM_PROMPT,
      userPrompt: buildInsideJokePrompt(input),
      schemaName: "inside_joke_showdown_output",
      schema: GENERIC_GAME_JSON_SCHEMA,
    });

    if (!raw) {
      return { output: buildFallbackInsideJokeShowdown(input), source: "fallback" };
    }

    return {
      output: generatedGameOutputSchema.parse(raw),
      source: "ai",
    };
  } catch (error) {
    await captureServerError(error, { template: "trivia-trek", stage: "generate" });
    return { output: buildFallbackInsideJokeShowdown(input), source: "fallback" };
  }
}
