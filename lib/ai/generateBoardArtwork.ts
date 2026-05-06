import {
  getOpenAIImageModel,
  getOpenAIImageQuality,
  getOpenAIImageSize,
  getOptionalEnv,
} from "@/lib/env";
import { captureServerError } from "@/lib/monitoring";
import {
  buildStorageKey,
  buildStoragePublicUrl,
  storeGeneratedFile,
  storedFileExists,
} from "@/lib/storage";
import { buildBoardArtworkPrompt } from "@/lib/ai/boardArtworkPrompt";
import {
  reviewBoardArtwork,
  type BoardArtworkReviewReport,
} from "@/lib/ai/boardArtworkReview";
import type { TemplateSlug } from "@/lib/templates/types";
import type { ProjectOutputPayload } from "@/lib/validation/project";

const ARTWORK_FILE_NAME = "board-artwork.png";
const REVIEW_FILE_NAME = "board-artwork-review.json";
const MAX_REVIEW_ATTEMPTS = 3;

export async function getExistingBoardArtwork(projectId: string) {
  const storageKey = buildStorageKey(projectId, ARTWORK_FILE_NAME);
  const reviewStorageKey = buildStorageKey(projectId, REVIEW_FILE_NAME);
  const exists = await storedFileExists(storageKey);
  const reviewExists = await storedFileExists(reviewStorageKey);

  if (!exists || !reviewExists) {
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
  templateSlug?: TemplateSlug;
  recipientName?: string;
  occasion?: string;
  output?: ProjectOutputPayload;
  inputJson?: unknown;
  forceRegenerate?: boolean;
}) {
  const existing = args.forceRegenerate ? null : await getExistingBoardArtwork(args.projectId);

  if (existing) {
    return existing;
  }

  const apiKey = getOptionalEnv("OPENAI_API_KEY");

  if (!apiKey) {
    return null;
  }

  try {
    let revisionPrompt = "";
    let lastReview: BoardArtworkReviewReport | null = null;

    for (let attempt = 1; attempt <= MAX_REVIEW_ATTEMPTS; attempt += 1) {
      const prompt =
        args.templateSlug && args.recipientName && args.occasion && args.output
          ? buildBoardArtworkPrompt({
              templateSlug: args.templateSlug,
              recipientName: args.recipientName,
              occasion: args.occasion,
              output: args.output,
              basePrompt: args.prompt,
              inputJson: args.inputJson,
              revisionPrompt,
            })
          : `${args.prompt}

Create premium board-game artwork suitable for a real personalized tabletop product.
No readable text, letters, numbers, logos, trademarks, mascots, brand marks, or protected trade dress.
Do not resemble Monopoly, Clue, or any existing board-game layout.
Leave clean blank zones where the app can overlay deterministic SVG/PDF text.
${revisionPrompt ? `Revision instructions from QA reviewers:\n${revisionPrompt}` : ""}`;

      const image = await requestBoardImage(apiKey, prompt);
      await storeGeneratedFile({
        projectId: args.projectId,
        fileName: `board-artwork-attempt-${attempt}.png`,
        content: image,
      });

      const review =
        args.templateSlug && args.recipientName && args.occasion && args.output
          ? await reviewBoardArtwork({
              image,
              attempt,
              templateSlug: args.templateSlug,
              recipientName: args.recipientName,
              occasion: args.occasion,
              inputJson: args.inputJson,
              output: args.output,
            })
          : null;

      if (!review) {
        const stored = await storeApprovedArtwork(args.projectId, image, {
          approved: true,
          attempt,
          reviewSkipped: true,
          reason: "Structured artwork review was unavailable.",
        });
        return stored;
      }

      lastReview = review;
      await storeReviewReport(args.projectId, review);

      if (review.approved) {
        const stored = await storeApprovedArtwork(args.projectId, image, review);
        return stored;
      }

      revisionPrompt = review.revisionPrompt;
    }

    if (lastReview) {
      await storeReviewReport(args.projectId, {
        ...lastReview,
        approved: false,
        exhaustedAttempts: true,
      });
    }

    return null;
  } catch (error) {
    await captureServerError(error, { stage: "board_artwork", projectId: args.projectId });
    return null;
  }
}

async function requestBoardImage(apiKey: string, prompt: string) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAIImageModel(),
      prompt,
      size: getOpenAIImageSize(),
      quality: getOpenAIImageQuality(),
      background: "opaque",
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

  return Buffer.from(base64, "base64");
}

async function storeReviewReport(projectId: string, review: Record<string, unknown>) {
  return storeGeneratedFile({
    projectId,
    fileName: REVIEW_FILE_NAME,
    content: Buffer.from(JSON.stringify(review, null, 2)),
  });
}

async function storeApprovedArtwork(
  projectId: string,
  image: Buffer,
  review: Record<string, unknown>,
) {
  const stored = await storeGeneratedFile({
    projectId,
    fileName: ARTWORK_FILE_NAME,
    content: image,
  });
  await storeReviewReport(projectId, review);
  return stored;
}
