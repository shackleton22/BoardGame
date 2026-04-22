import { buildFallbackLifeQuest, normalizeLifeQuestOutput } from "@/lib/ai/fallbackLifeQuest";
import { captureServerError } from "@/lib/monitoring";
import { requestStructuredJson } from "@/lib/ai/openai";
import {
  buildLifeQuestPrompt,
  LIFE_QUEST_JSON_SCHEMA,
  LIFE_QUEST_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  lifeQuestAiSchema,
  type LifeQuestAIOutput,
  type LifeQuestWizardInput,
  type ProjectOutputPayload,
} from "@/lib/validation/project";

export async function generateLifeQuestAiContent(
  input: LifeQuestWizardInput,
): Promise<{ output: LifeQuestAIOutput; source: "ai" | "fallback" }> {
  try {
    const raw = await requestStructuredJson({
      systemPrompt: LIFE_QUEST_SYSTEM_PROMPT,
      userPrompt: buildLifeQuestPrompt(input),
      schemaName: "life_quest_output",
      schema: LIFE_QUEST_JSON_SCHEMA,
    });

    if (!raw) {
      return { output: buildFallbackLifeQuest(input), source: "fallback" };
    }

    return {
      output: lifeQuestAiSchema.parse(raw),
      source: "ai",
    };
  } catch (error) {
    await captureServerError(error, { template: "life-quest", stage: "generate" });
    return { output: buildFallbackLifeQuest(input), source: "fallback" };
  }
}

export async function generateLifeQuestContent(
  input: LifeQuestWizardInput,
): Promise<{ output: ProjectOutputPayload; source: "ai" | "fallback" }> {
  const { output, source } = await generateLifeQuestAiContent(input);
  return {
    output: normalizeLifeQuestOutput(output),
    source,
  };
}
