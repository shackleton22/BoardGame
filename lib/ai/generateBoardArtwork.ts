import { getOpenAIImageModel, getOptionalEnv } from "@/lib/env";
import { captureServerError } from "@/lib/monitoring";
import {
  buildStorageKey,
  buildStoragePublicUrl,
  storeGeneratedFile,
  storedFileExists,
} from "@/lib/storage";

const ARTWORK_FILE_NAME = "board-artwork.png";

export async function getExistingBoardArtwork(projectId: string) {
  const storageKey = buildStorageKey(projectId, ARTWORK_FILE_NAME);
  const exists = await storedFileExists(storageKey);

  if (!exists) {
    return null;
  }

  return {
    storageKey,
    publicUrl: buildStoragePublicUrl(storageKey),
  };
}

export async function generateBoardArtwork(args: {
  projectId: string;
  prompt: string;
}) {
  const existing = await getExistingBoardArtwork(args.projectId);

  if (existing) {
    return existing;
  }

  const apiKey = getOptionalEnv("OPENAI_API_KEY");

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getOpenAIImageModel(),
        prompt: `${args.prompt}

Create premium board-game decorative artwork only.
No text, letters, numbers, logos, trademarks, mascots, brand marks, or protected trade dress.
Do not resemble Monopoly, Clue, or any existing board-game layout.
Use elegant background artwork that can sit behind deterministic print text.`,
        size: "1024x1024",
        quality: "high",
        background: "transparent",
        output_format: "png",
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const base64 = payload.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error("Image generation returned no image data.");
    }

    const stored = await storeGeneratedFile({
      projectId: args.projectId,
      fileName: ARTWORK_FILE_NAME,
      content: Buffer.from(base64, "base64"),
    });

    return stored;
  } catch (error) {
    await captureServerError(error, { stage: "board_artwork", projectId: args.projectId });
    return null;
  }
}
