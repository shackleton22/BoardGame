import { getOpenAITextModel, getOptionalEnv } from "@/lib/env";

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const data = payload as Record<string, unknown>;

  if (typeof data.output_text === "string" && data.output_text.length > 0) {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  const texts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as { content?: unknown[] }).content)
      ? ((item as { content: unknown[] }).content ?? [])
      : [];

    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        "text" in part &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        texts.push((part as { text: string }).text);
      }
    }
  }

  return texts.join("\n").trim();
}

export async function requestStructuredJson(args: {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schema: object;
}) {
  const apiKey = getOptionalEnv("OPENAI_API_KEY");

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAITextModel(),
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: args.systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: args.userPrompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: args.schemaName,
          strict: true,
          schema: args.schema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const text = extractResponseText(payload);

  if (!text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return JSON.parse(text) as unknown;
}
