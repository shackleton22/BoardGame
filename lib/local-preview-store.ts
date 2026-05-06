import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

import { ProductTier, ProjectItemCategory, ProjectStatus } from "@prisma/client";

import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";
import type { ProjectCreateInput, ProjectOutputPayload } from "@/lib/validation/project";

type LocalProjectItem = {
  id: string;
  projectId: string;
  name: string;
  category: ProjectItemCategory;
  note: string | null;
  sortOrder: number;
};

export type LocalProjectRecord = {
  id: string;
  templateId: string;
  template: {
    id: string;
    slug: TemplateSlug;
    name: string;
    description: string;
    shortDescription: string;
    status: string;
    sortOrder: number;
    metadataJson: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  };
  templateSlug: TemplateSlug;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  recipientName: string;
  buyerName: string;
  occasion: string;
  tone: string;
  relationship: string;
  visualStyle: string;
  colorMood: string;
  titleOverride: string | null;
  subtitleOverride: string | null;
  avoidNotes: string | null;
  productTier: ProductTier;
  shippingJson: ProjectCreateInput["shipping"] | null;
  inputJson: ProjectCreateInput;
  outputJson: ProjectOutputPayload & { generationSource?: "ai" | "fallback" };
  previewRegenerationCount: number;
  errorMessage: string | null;
  items: LocalProjectItem[];
  assets: [];
  shippingQuotes: [];
  operationalEvents: [];
  orders: [];
};

type SerializedLocalProjectRecord = Omit<
  LocalProjectRecord,
  "createdAt" | "updatedAt" | "template"
> & {
  createdAt: string;
  updatedAt: string;
  template: Omit<LocalProjectRecord["template"], "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  };
};

type LocalProjectStore = {
  projects: Record<string, SerializedLocalProjectRecord>;
};

const STORE_PATH = path.join(
  process.cwd(),
  "public",
  "generated",
  "_local-preview-projects.json",
);

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(5).toString("hex")}`;
}

function serializeProject(project: LocalProjectRecord): SerializedLocalProjectRecord {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    template: {
      ...project.template,
      createdAt: project.template.createdAt.toISOString(),
      updatedAt: project.template.updatedAt.toISOString(),
    },
  };
}

function deserializeProject(project: SerializedLocalProjectRecord): LocalProjectRecord {
  return {
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
    template: {
      ...project.template,
      createdAt: new Date(project.template.createdAt),
      updatedAt: new Date(project.template.updatedAt),
    },
  };
}

async function readStore(): Promise<LocalProjectStore> {
  try {
    return JSON.parse(await readFile(STORE_PATH, "utf8")) as LocalProjectStore;
  } catch {
    return { projects: {} };
  }
}

async function writeStore(store: LocalProjectStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function buildTemplateSnapshot(slug: TemplateSlug, now: Date) {
  const template = getTemplateDefinition(slug);

  return {
    id: `local_template_${slug}`,
    slug,
    name: template.name,
    description: template.description,
    shortDescription: template.shortDescription,
    status: template.status,
    sortOrder: 0,
    metadataJson: {
      landingBadge: template.landingBadge,
      heroBullets: template.heroBullets,
      questionSummary: template.questionSummary,
      componentSetSummary: template.componentSetSummary,
      packoutChecklist: template.packoutChecklist,
      bomVersion: template.bomVersion,
      localPreviewMode: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export async function createLocalPreviewProject(args: {
  input: ProjectCreateInput;
  output: ProjectOutputPayload;
  source: "ai" | "fallback";
}) {
  const now = new Date();
  const template = getTemplateDefinition(args.input.templateSlug);
  const id = createId("local_project");
  const projectItems = template.buildProjectItems(args.input as never);

  const project: LocalProjectRecord = {
    id,
    templateId: `local_template_${args.input.templateSlug}`,
    template: buildTemplateSnapshot(args.input.templateSlug, now),
    templateSlug: args.input.templateSlug,
    createdAt: now,
    updatedAt: now,
    status: ProjectStatus.preview_ready,
    recipientName: args.input.recipientName,
    buyerName: args.input.buyerName,
    occasion: args.input.occasion,
    tone: args.input.tone,
    relationship: args.input.relationship,
    visualStyle: args.input.visualStyle,
    colorMood: args.input.colorMood,
    titleOverride: args.input.titleOverride ?? null,
    subtitleOverride: args.input.subtitleOverride ?? null,
    avoidNotes: args.input.avoidNotes ?? null,
    productTier: args.input.productTier,
    shippingJson: args.input.shipping ?? null,
    inputJson: args.input,
    outputJson: {
      ...args.output,
      generationSource: args.source,
    },
    previewRegenerationCount: 0,
    errorMessage: null,
    items: projectItems.map((item, index) => ({
      id: createId("local_item"),
      projectId: id,
      name: item.name,
      category: item.category,
      note: item.note ?? null,
      sortOrder: item.sortOrder ?? index,
    })),
    assets: [],
    shippingQuotes: [],
    operationalEvents: [],
    orders: [],
  };

  const store = await readStore();
  store.projects[id] = serializeProject(project);
  await writeStore(store);

  return project;
}

export async function getLocalPreviewProject(projectId: string) {
  const store = await readStore();
  const project = store.projects[projectId];

  return project ? deserializeProject(project) : null;
}

export async function updateLocalPreviewProjectOutput(
  projectId: string,
  output: ProjectOutputPayload,
) {
  const store = await readStore();
  const project = store.projects[projectId];

  if (!project) {
    throw new Error("Project not found.");
  }

  const updated = deserializeProject({
    ...project,
    updatedAt: new Date().toISOString(),
    outputJson: {
      ...project.outputJson,
      ...output,
    },
  });

  store.projects[projectId] = serializeProject(updated);
  await writeStore(store);

  return updated;
}

export async function regenerateLocalPreviewProject(args: {
  projectId: string;
  output: ProjectOutputPayload;
  source: "ai" | "fallback";
}) {
  const store = await readStore();
  const project = store.projects[args.projectId];

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.previewRegenerationCount >= 1) {
    throw new Error("This preview has already been regenerated once.");
  }

  const updated = deserializeProject({
    ...project,
    updatedAt: new Date().toISOString(),
    outputJson: {
      ...args.output,
      generationSource: args.source,
    },
    previewRegenerationCount: project.previewRegenerationCount + 1,
  });

  store.projects[args.projectId] = serializeProject(updated);
  await writeStore(store);

  return updated;
}
