import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildTemplateShowcasePrompt } from "@/lib/ai/boardArtworkPrompt";
import { reviewBoardArtwork } from "@/lib/ai/boardArtworkReview";
import {
  getOpenAIImageModel,
  getOpenAIImageQuality,
  getOpenAIImageSize,
  getOptionalEnv,
} from "@/lib/env";
import { getTemplateExampleProofs } from "@/lib/templates/example-proofs";

const SHOWCASE_DIR = path.join(process.cwd(), "public", "template-showcase");
const MAX_ATTEMPTS = 3;

async function generateImage(prompt: string) {
  const apiKey = getOptionalEnv("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate showcase images.");
  }

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
    const body = await response.text();
    throw new Error(`OpenAI image generation failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  const base64 = payload.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error("OpenAI image generation returned no image data.");
  }

  return Buffer.from(base64, "base64");
}

async function main() {
  await mkdir(SHOWCASE_DIR, { recursive: true });

  for (const example of getTemplateExampleProofs()) {
    let image: Buffer | null = null;
    let revisionPrompt = "";
    let finalReview: Awaited<ReturnType<typeof reviewBoardArtwork>> = null;
    let approved = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const prompt = buildTemplateShowcasePrompt({
        templateSlug: example.slug,
        templateName: example.templateName,
        recipientName: example.recipientName,
        occasion: example.occasion,
        inputJson: example.inputJson,
        output: example.output,
        revisionPrompt,
      });
      image = await generateImage(prompt);
      await writeFile(
        path.join(SHOWCASE_DIR, `${example.slug}.attempt-${attempt}.png`),
        image,
      );

      const review = await reviewBoardArtwork({
        image,
        attempt,
        templateSlug: example.slug,
        recipientName: example.recipientName,
        occasion: example.occasion,
        inputJson: example.inputJson,
        output: example.output,
      });

      finalReview = review;

      if (!review) {
        throw new Error(`Artwork review did not run for ${example.slug}.`);
      }

      if (review.approved) {
        approved = true;
        break;
      }

      revisionPrompt = review.revisionPrompt;
      console.log(
        `${example.slug} attempt ${attempt} needs revision: ${[
          ...review.gameplay.blockingIssues,
          ...review.personalization.blockingIssues,
        ].join("; ")}`,
      );
    }

    if (!image) {
      throw new Error(`No image generated for ${example.slug}.`);
    }

    if (!approved) {
      await writeFile(
        path.join(SHOWCASE_DIR, `${example.slug}.review.json`),
        JSON.stringify(
          finalReview ?? { approved: false, reason: "No review completed." },
          null,
          2,
        ),
      );
      throw new Error(
        `${example.slug} failed artwork QA after ${MAX_ATTEMPTS} attempts; existing storefront image was not overwritten.`,
      );
    }

    const filePath = path.join(SHOWCASE_DIR, `${example.slug}.png`);
    await writeFile(filePath, image);
    await writeFile(
      path.join(SHOWCASE_DIR, `${example.slug}.review.json`),
      JSON.stringify(finalReview ?? { reviewSkipped: true }, null, 2),
    );
    console.log(`Generated ${filePath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
