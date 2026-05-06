import {
  GeneratedAssetStatus,
  Prisma,
  type Project,
} from "@prisma/client";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

import { generateBoardArtwork } from "@/lib/ai/generateBoardArtwork";
import { db } from "@/lib/db";
import { renderCardsPdf } from "@/lib/render/cardsPdf";
import { renderRulesPdf } from "@/lib/render/rulesPdf";
import { readStoredFile, storeGeneratedFile } from "@/lib/storage";
import { buildTemplateDecorativeImageDataUrl } from "@/lib/templates/preview-art";
import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";
import type { ProjectOutputPayload } from "@/lib/validation/project";

export const GENERATED_ASSET_TYPES = {
  boardPreviewPng: "board_preview_png",
  thumbnailPng: "thumbnail_png",
  boardFinalPng: "board_final_png",
  boardFinalPdf: "board_final_pdf",
  deckPrimaryPdf: "deck_primary_pdf",
  deckSecondaryPdf: "deck_secondary_pdf",
  rulesPdf: "rules_pdf",
  fulfillmentManifestJson: "fulfillment_manifest_json",
} as const;

async function upsertAsset(args: {
  projectId: string;
  type: string;
  label: string;
  fileName: string;
  content: Buffer;
  mimeType: string;
  width?: number;
  height?: number;
  metadataJson?: Record<string, unknown>;
}) {
  const stored = await storeGeneratedFile({
    projectId: args.projectId,
    fileName: args.fileName,
    content: args.content,
  });

  return db.generatedAsset.upsert({
    where: {
      projectId_type: {
        projectId: args.projectId,
        type: args.type,
      },
    },
    update: {
      label: args.label,
      fileName: args.fileName,
      url: stored.publicUrl,
      storageKey: stored.storageKey,
      mimeType: args.mimeType,
      status: GeneratedAssetStatus.ready,
      width: args.width,
      height: args.height,
      metadataJson: args.metadataJson as Prisma.InputJsonValue | undefined,
    },
    create: {
      projectId: args.projectId,
      type: args.type,
      label: args.label,
      fileName: args.fileName,
      url: stored.publicUrl,
      storageKey: stored.storageKey,
      mimeType: args.mimeType,
      status: GeneratedAssetStatus.ready,
      width: args.width,
      height: args.height,
      metadataJson: args.metadataJson as Prisma.InputJsonValue | undefined,
    },
  });
}

async function renderBoardPdf(png: Buffer) {
  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(png);
  const page = pdf.addPage([792, 792]);

  page.drawImage(image, {
    x: 18,
    y: 18,
    width: 756,
    height: 756,
  });

  return Buffer.from(await pdf.save());
}

async function getBackgroundArtDataUrl(
  projectId: string,
  templateSlug: TemplateSlug,
  artPrompt: string | undefined,
  project: {
    recipientName: string;
    occasion: string;
    output: ProjectOutputPayload;
    inputJson?: unknown;
  },
  options: {
    forceRegenerate?: boolean;
  } = {},
) {
  if (!artPrompt) {
    return buildTemplateDecorativeImageDataUrl(templateSlug);
  }

  const artwork = await generateBoardArtwork({
    projectId,
    prompt: artPrompt,
    templateSlug,
    recipientName: project.recipientName,
    occasion: project.occasion,
    output: project.output,
    inputJson: project.inputJson,
    forceRegenerate: options.forceRegenerate,
  });

  if (!artwork?.storageKey) {
    return buildTemplateDecorativeImageDataUrl(templateSlug);
  }

  const bytes = await readStoredFile(artwork.storageKey);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export async function generatePreviewAssets(project: {
  id: string;
  templateSlug: TemplateSlug;
  recipientName: string;
  occasion: string;
  visualStyle: string;
  colorMood: string;
  inputJson?: unknown;
  outputJson: unknown;
  forceRegenerateArtwork?: boolean;
}) {
  const output = project.outputJson as ProjectOutputPayload;
  const template = getTemplateDefinition(project.templateSlug);
  const backgroundArtDataUrl = await getBackgroundArtDataUrl(
    project.id,
    project.templateSlug,
    output.artPrompt,
    {
      recipientName: project.recipientName,
      occasion: project.occasion,
      output,
      inputJson: project.inputJson,
    },
    { forceRegenerate: project.forceRegenerateArtwork },
  );
  const svg = template.renderBoard({
    output,
    project: {
      recipientName: project.recipientName,
      occasion: project.occasion,
      visualStyle: project.visualStyle,
      colorMood: project.colorMood,
    },
    backgroundArtDataUrl,
  });

  const previewPng = await sharp(Buffer.from(svg)).png({ quality: 100 }).toBuffer();
  const thumbnail = await sharp(Buffer.from(svg)).resize(720, 720).png().toBuffer();

  await Promise.all([
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.boardPreviewPng,
      label: "Board preview",
      fileName: "board-preview.png",
      content: previewPng,
      mimeType: "image/png",
      width: 1600,
      height: 1600,
    }),
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.thumbnailPng,
      label: "Thumbnail",
      fileName: "thumbnail.png",
      content: thumbnail,
      mimeType: "image/png",
      width: 720,
      height: 720,
    }),
  ]);
}

export async function generateFinalAssets(project: Project & { templateSlug: string }) {
  const output = project.outputJson as ProjectOutputPayload;
  const template = getTemplateDefinition(project.templateSlug as TemplateSlug);
  const backgroundArtDataUrl = await getBackgroundArtDataUrl(
    project.id,
    project.templateSlug as TemplateSlug,
    output.artPrompt,
    {
      recipientName: project.recipientName,
      occasion: project.occasion,
      output,
      inputJson: project.inputJson,
    },
  );
  const boardSvg = template.renderBoard({
    output,
    project: {
      recipientName: project.recipientName,
      occasion: project.occasion,
      visualStyle: project.visualStyle,
      colorMood: project.colorMood,
    },
    mode: "final",
    backgroundArtDataUrl,
  });

  const boardFinalPng = await sharp(Buffer.from(boardSvg))
    .resize(3200, 3200)
    .png({ quality: 100 })
    .toBuffer();
  const boardFinalPdf = await renderBoardPdf(boardFinalPng);
  const primaryCardsPdf = await renderCardsPdf({
    cards: output.deckPrimary,
    label: output.deckPrimaryLabel,
    accentHex: "#ca6f4b",
    recipientName: project.recipientName,
  });
  const secondaryCardsPdf = await renderCardsPdf({
    cards: output.deckSecondary,
    label: output.deckSecondaryLabel,
    accentHex: "#264653",
    recipientName: project.recipientName,
  });
  const rulesPdf = await renderRulesPdf({
    output,
    project: {
      recipientName: project.recipientName,
      occasion: project.occasion,
    },
  });

  await Promise.all([
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.boardFinalPng,
      label: "Board PNG",
      fileName: "board_final.png",
      content: boardFinalPng,
      mimeType: "image/png",
      width: 3200,
      height: 3200,
    }),
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.boardFinalPdf,
      label: "Board PDF",
      fileName: "board_final.pdf",
      content: boardFinalPdf,
      mimeType: "application/pdf",
    }),
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.deckPrimaryPdf,
      label: output.deckPrimaryLabel,
      fileName: `${output.deckPrimaryLabel.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      content: primaryCardsPdf,
      mimeType: "application/pdf",
    }),
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.deckSecondaryPdf,
      label: output.deckSecondaryLabel,
      fileName: `${output.deckSecondaryLabel.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      content: secondaryCardsPdf,
      mimeType: "application/pdf",
    }),
    upsertAsset({
      projectId: project.id,
      type: GENERATED_ASSET_TYPES.rulesPdf,
      label: "Rules PDF",
      fileName: "rules.pdf",
      content: rulesPdf,
      mimeType: "application/pdf",
    }),
  ]);

  await db.project.update({
    where: { id: project.id },
    data: { status: "asset_ready" },
  });

  return db.generatedAsset.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "asc" },
  });
}
