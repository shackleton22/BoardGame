import type { ProductTier, ProjectItemCategory } from "@prisma/client";
import type { ZodType } from "zod";

import type { ProjectOutputPayload } from "@/lib/validation/project";

export type TemplateSlug =
  | "life-quest"
  | "mystery-night"
  | "inside-joke-showdown";

export type BoardRenderArgs = {
  output: ProjectOutputPayload;
  project: {
    recipientName: string;
    occasion: string;
    visualStyle: string;
    colorMood: string;
  };
  mode?: "preview" | "final";
  backgroundArtDataUrl?: string;
};

export type TemplateProjectItem = {
  name: string;
  category: ProjectItemCategory;
  note?: string;
  sortOrder: number;
};

export type TemplateCatalogTier = {
  tier: ProductTier;
  label: string;
  amount: number;
  enabled: boolean;
  description: string;
  badge?: string;
};

export type TemplateQuestionSummary = {
  label: string;
  description: string;
};

export type TemplateVendorComponent = {
  componentKey: string;
  componentLabel: string;
  quantity: number;
  notes: string;
  mode: "bundle" | "component";
  requiredForQuotes?: boolean;
  envKey?: string;
};

export type TemplateDefinition<Input> = {
  slug: TemplateSlug;
  name: string;
  shortDescription: string;
  description: string;
  status: "available" | "coming_soon";
  boardStyle: ProjectOutputPayload["boardStyle"];
  deckLabels: {
    primary: string;
    secondary: string;
  };
  tileTypeOptions: ProjectOutputPayload["tiles"][number]["type"][];
  landingBadge: string;
  heroBullets: string[];
  questionSummary: TemplateQuestionSummary[];
  tiers: TemplateCatalogTier[];
  productionWindow: {
    minDays: number;
    maxDays: number;
    quoteTtlHours: number;
  };
  bomVersion: string;
  componentSetSummary: string[];
  vendorComponents: TemplateVendorComponent[];
  schema: ZodType<Input>;
  parseInput: (raw: unknown) => Input;
  buildProjectItems: (input: Input) => TemplateProjectItem[];
  generateContent: (
    input: Input,
  ) => Promise<{ output: ProjectOutputPayload; source: "ai" | "fallback" }>;
  renderBoard: (args: BoardRenderArgs) => string;
};
