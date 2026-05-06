import { z } from "zod";

import { requestStructuredJsonWithImages } from "@/lib/ai/openai";
import type { TemplateSlug } from "@/lib/templates/types";
import type { ProjectOutputPayload } from "@/lib/validation/project";

const signalSchema = z.object({
  inputPath: z.string(),
  expected: z.string(),
  reflected: z.enum(["clear", "partial", "missing", "contradicted"]),
  evidence: z.string(),
});

const gameplayReviewSchema = z.object({
  verdict: z.enum(["pass", "needs_revision", "fail"]),
  score: z.number().int().min(0).max(100),
  criteria: z.object({
    boardLooksFinished: z.number().int().min(0).max(5),
    playableStructure: z.number().int().min(0).max(5),
    completePathOrPlayArea: z.number().int().min(0).max(5),
    componentCompleteness: z.number().int().min(0).max(5),
    textOverlayReadiness: z.number().int().min(0).max(5),
    noReadableTextOrIpRisk: z.number().int().min(0).max(5),
  }),
  blockingIssues: z.array(z.string()),
  suggestedPromptAdditions: z.array(z.string()),
  summary: z.string(),
});

const personalizationReviewSchema = z.object({
  verdict: z.enum(["pass", "needs_revision", "fail"]),
  score: z.number().int().min(0).max(100),
  requiredSignals: z.array(signalSchema),
  criteria: z.object({
    recipientOccasion: z.number().int().min(0).max(5),
    templateSpecificInputs: z.number().int().min(0).max(5),
    styleAndMood: z.number().int().min(0).max(5),
    titleSubtitleAlignment: z.number().int().min(0).max(5),
    avoidNotesCompliance: z.number().int().min(0).max(5),
    noReadableTextOrIpRisk: z.number().int().min(0).max(5),
  }),
  blockingIssues: z.array(z.string()),
  suggestedPromptAdditions: z.array(z.string()),
  summary: z.string(),
});

export const boardArtworkReviewReportSchema = z.object({
  approved: z.boolean(),
  attempt: z.number().int().min(1),
  gameplay: gameplayReviewSchema,
  personalization: personalizationReviewSchema,
  revisionPrompt: z.string(),
});

export type BoardArtworkReviewReport = z.infer<typeof boardArtworkReviewReportSchema>;

const gameplayReviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["verdict", "score", "criteria", "blockingIssues", "suggestedPromptAdditions", "summary"],
  properties: {
    verdict: { type: "string", enum: ["pass", "needs_revision", "fail"] },
    score: { type: "integer", minimum: 0, maximum: 100 },
    criteria: {
      type: "object",
      additionalProperties: false,
      required: [
        "boardLooksFinished",
        "playableStructure",
        "completePathOrPlayArea",
        "componentCompleteness",
        "textOverlayReadiness",
        "noReadableTextOrIpRisk",
      ],
      properties: {
        boardLooksFinished: { type: "integer", minimum: 0, maximum: 5 },
        playableStructure: { type: "integer", minimum: 0, maximum: 5 },
        completePathOrPlayArea: { type: "integer", minimum: 0, maximum: 5 },
        componentCompleteness: { type: "integer", minimum: 0, maximum: 5 },
        textOverlayReadiness: { type: "integer", minimum: 0, maximum: 5 },
        noReadableTextOrIpRisk: { type: "integer", minimum: 0, maximum: 5 },
      },
    },
    blockingIssues: { type: "array", items: { type: "string" } },
    suggestedPromptAdditions: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
} as const;

const personalizationReviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "verdict",
    "score",
    "requiredSignals",
    "criteria",
    "blockingIssues",
    "suggestedPromptAdditions",
    "summary",
  ],
  properties: {
    verdict: { type: "string", enum: ["pass", "needs_revision", "fail"] },
    score: { type: "integer", minimum: 0, maximum: 100 },
    requiredSignals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["inputPath", "expected", "reflected", "evidence"],
        properties: {
          inputPath: { type: "string" },
          expected: { type: "string" },
          reflected: { type: "string", enum: ["clear", "partial", "missing", "contradicted"] },
          evidence: { type: "string" },
        },
      },
    },
    criteria: {
      type: "object",
      additionalProperties: false,
      required: [
        "recipientOccasion",
        "templateSpecificInputs",
        "styleAndMood",
        "titleSubtitleAlignment",
        "avoidNotesCompliance",
        "noReadableTextOrIpRisk",
      ],
      properties: {
        recipientOccasion: { type: "integer", minimum: 0, maximum: 5 },
        templateSpecificInputs: { type: "integer", minimum: 0, maximum: 5 },
        styleAndMood: { type: "integer", minimum: 0, maximum: 5 },
        titleSubtitleAlignment: { type: "integer", minimum: 0, maximum: 5 },
        avoidNotesCompliance: { type: "integer", minimum: 0, maximum: 5 },
        noReadableTextOrIpRisk: { type: "integer", minimum: 0, maximum: 5 },
      },
    },
    blockingIssues: { type: "array", items: { type: "string" } },
    suggestedPromptAdditions: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
} as const;

function summarizeInput(inputJson: unknown) {
  if (!inputJson || typeof inputJson !== "object") {
    return "No raw wizard input was provided.";
  }

  const input = inputJson as Record<string, unknown>;
  const lines = [
    `recipientName: ${String(input.recipientName ?? "")}`,
    `buyerName: ${String(input.buyerName ?? "")}`,
    `occasion: ${String(input.occasion ?? "")}`,
    `tone: ${String(input.tone ?? "")}`,
    `relationship: ${String(input.relationship ?? "")}`,
    `visualStyle: ${String(input.visualStyle ?? "")}`,
    `colorMood: ${String(input.colorMood ?? "")}`,
    `titleOverride: ${String(input.titleOverride ?? "")}`,
    `subtitleOverride: ${String(input.subtitleOverride ?? "")}`,
    `avoidNotes: ${String(input.avoidNotes ?? "")}`,
  ];

  for (const key of [
    "places",
    "dealCards",
    "items",
    "people",
    "cluePrompts",
    "suspects",
    "locations",
    "clues",
    "insideJokes",
    "rapidChallenges",
    "catchphrases",
  ]) {
    const value = input[key];
    if (Array.isArray(value)) {
      lines.push(`${key}: ${JSON.stringify(value).slice(0, 1600)}`);
    }
  }

  return lines.join("\n");
}

function summarizeOutput(output: ProjectOutputPayload) {
  return [
    `title: ${output.title}`,
    `subtitle: ${output.subtitle}`,
    `themeSummary: ${output.themeSummary}`,
    `centerKicker: ${output.centerKicker ?? ""}`,
    `boardStyle: ${output.boardStyle}`,
    `tiles: ${output.tiles.map((tile) => `${tile.name} (${tile.type})`).join(", ")}`,
    `deckPrimaryLabel: ${output.deckPrimaryLabel}`,
    `deckSecondaryLabel: ${output.deckSecondaryLabel}`,
    `primaryCards: ${output.deckPrimary.slice(0, 10).map((card) => card.title).join(", ")}`,
    `secondaryCards: ${output.deckSecondary.slice(0, 10).map((card) => card.title).join(", ")}`,
  ].join("\n");
}

function templateGameplayChecklist(templateSlug: TemplateSlug) {
  switch (templateSlug) {
    case "home-turf":
      return "Must read as a complete place-collecting board: full board visible, perimeter/path connects, place tiles visible, center art/title area, card deck areas, score/token cues.";
    case "case-file":
      return "Must read as a mystery board: central floor plan or investigation board, room/scene areas connect logically, suspect/evidence/card panels exist, accusation/theory area exists.";
    case "face-card":
      return "Must read as a people-guessing board: many portrait slots/cards, clue/reveal deck areas, category/marker areas, enough structure to support elimination/guessing gameplay.";
    case "trivia-trek":
      return "Must read as a trivia board: circular/category track or clear scoring path, category wedges/areas, prompt/bonus card decks, final-question or scoring area.";
    case "milestone-trail":
    default:
      return "Must read as a life-journey board: connected winding path, milestone/story spaces, memory/quest deck areas, central title/keepsake area, token/spinner/die cues.";
  }
}

export function isBoardArtworkReviewPassable(report: {
  gameplay: z.infer<typeof gameplayReviewSchema>;
  personalization: z.infer<typeof personalizationReviewSchema>;
}) {
  const gameplayBlocks = report.gameplay.blockingIssues.length === 0;
  const personalizationBlocks = report.personalization.blockingIssues.length === 0;
  const noContradictions = report.personalization.requiredSignals.every(
    (signal) => signal.reflected !== "contradicted",
  );

  return (
    report.gameplay.verdict === "pass" &&
    report.personalization.verdict === "pass" &&
    report.gameplay.score >= 78 &&
    report.personalization.score >= 75 &&
    gameplayBlocks &&
    personalizationBlocks &&
    noContradictions
  );
}

export async function reviewBoardArtwork(args: {
  image: Buffer;
  attempt: number;
  templateSlug: TemplateSlug;
  recipientName: string;
  occasion: string;
  inputJson?: unknown;
  output: ProjectOutputPayload;
}) {
  const image = { mimeType: "image/png", data: args.image };
  const outputSummary = summarizeOutput(args.output);
  const inputSummary = summarizeInput(args.inputJson);

  const gameplayRaw = await requestStructuredJsonWithImages({
    systemPrompt:
      "You are a senior board-game product designer and prepress QA reviewer. Review generated board-game artwork strictly for playability, completeness, print-readiness, and IP/text safety. Be blunt and practical.",
    userPrompt: [
      `Template slug: ${args.templateSlug}`,
      `Recipient: ${args.recipientName}`,
      `Occasion: ${args.occasion}`,
      `Gameplay checklist: ${templateGameplayChecklist(args.templateSlug)}`,
      "",
      "Review criteria:",
      "- The image should look like a finished physical board game, not a diagram or generic art.",
      "- The board/play area must be complete and not cropped.",
      "- Paths, tracks, rooms, grids, or category wheels must appear usable and coherent.",
      "- There must be clear blank areas for deterministic title, labels, card text, and rules overlays.",
      "- There must be no readable AI-generated text, no logos, no trademarks, and no protected trade dress clone.",
      "- If any issue would embarrass us in a customer proof, mark needs_revision or fail.",
      "",
      `Generated output summary:\n${outputSummary}`,
    ].join("\n"),
    images: [image],
    schemaName: "gameplay_board_artwork_review",
    schema: gameplayReviewJsonSchema,
  });

  const personalizationRaw = await requestStructuredJsonWithImages({
    systemPrompt:
      "You are a personalization QA reviewer for a custom board-game gift company. Review whether the image concept reflects the customer inputs without relying on readable AI text.",
    userPrompt: [
      `Template slug: ${args.templateSlug}`,
      `Recipient: ${args.recipientName}`,
      `Occasion: ${args.occasion}`,
      "",
      `Original wizard input:\n${inputSummary}`,
      "",
      `Generated output summary:\n${outputSummary}`,
      "",
      "Review criteria:",
      "- The image should visibly reflect the template and customer-provided themes through motifs, props, scenes, portrait frames, places, clues, or category cues.",
      "- Recipient/occasion/style/tone should feel compatible even though final readable text is overlaid later.",
      "- High-priority user inputs should be represented as visual concepts where possible.",
      "- Avoid notes must not be violated.",
      "- No readable AI text, trademark text, or protected board-game names/logos should appear.",
      "- If the image is pretty but generic, mark needs_revision.",
    ].join("\n"),
    images: [image],
    schemaName: "personalization_board_artwork_review",
    schema: personalizationReviewJsonSchema,
  });

  if (!gameplayRaw || !personalizationRaw) {
    return null;
  }

  const gameplay = gameplayReviewSchema.parse(gameplayRaw);
  const personalization = personalizationReviewSchema.parse(personalizationRaw);
  const suggestedPromptAdditions = [
    ...gameplay.suggestedPromptAdditions,
    ...personalization.suggestedPromptAdditions,
  ];
  const blockingIssues = [...gameplay.blockingIssues, ...personalization.blockingIssues];
  const approved = isBoardArtworkReviewPassable({ gameplay, personalization });
  const revisionPrompt = approved
    ? ""
    : [
        "Revise the board image to fix these QA issues before approval:",
        ...blockingIssues.map((issue) => `- ${issue}`),
        ...suggestedPromptAdditions.map((addition) => `- ${addition}`),
        "Keep the same template, recipient, occasion, and premium top-down board-game product composition.",
        "Do not add readable text, logos, trademarks, brand names, mascots, or protected board-game trade dress.",
      ].join("\n");

  return boardArtworkReviewReportSchema.parse({
    approved,
    attempt: args.attempt,
    gameplay,
    personalization,
    revisionPrompt,
  });
}
