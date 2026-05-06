import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { listTemplateDefinitions, type TemplateSlug } from "@/lib/templates/registry";

type CheckLevel = "pass" | "warn" | "fail";

type Check = {
  level: CheckLevel;
  area: string;
  message: string;
  detail?: string;
};

const isLocalMode = process.argv.includes("--local");
const root = process.cwd();

function loadEnvFile(fileName: string) {
  const filePath = path.join(root, fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

for (const fileName of [".env", ".env.local", ".env.production"]) {
  loadEnvFile(fileName);
}

const checks: Check[] = [];

function add(level: CheckLevel, area: string, message: string, detail?: string) {
  checks.push({ level, area, message, detail });
}

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function requireEnv(area: string, names: string[]) {
  for (const name of names) {
    if (env(name)) {
      add("pass", area, `${name} is configured.`);
    } else {
      add("fail", area, `${name} is missing.`);
    }
  }
}

function warnEnv(area: string, names: string[]) {
  for (const name of names) {
    if (env(name)) {
      add("pass", area, `${name} is configured.`);
    } else {
      add("warn", area, `${name} is not configured.`);
    }
  }
}

function checkFile(area: string, filePath: string, minimumBytes = 1) {
  if (!existsSync(filePath)) {
    add("fail", area, `${path.relative(root, filePath)} is missing.`);
    return;
  }

  const size = statSync(filePath).size;

  if (size < minimumBytes) {
    add("fail", area, `${path.relative(root, filePath)} is unexpectedly small.`, `${size} bytes`);
    return;
  }

  add("pass", area, `${path.relative(root, filePath)} exists.`, `${size} bytes`);
}

function checkTemplates() {
  const templates = listTemplateDefinitions();
  const expectedSlugs: TemplateSlug[] = [
    "home-turf",
    "milestone-trail",
    "face-card",
    "case-file",
    "trivia-trek",
  ];
  const actualSlugs = templates.map((template) => template.slug);

  if (expectedSlugs.every((slug) => actualSlugs.includes(slug))) {
    add("pass", "Catalog", "All five launch templates are registered.");
  } else {
    add("fail", "Catalog", "Launch template registry is incomplete.", actualSlugs.join(", "));
  }

  for (const template of templates) {
    const digital = template.tiers.find((tier) => tier.tier === "digital_print_kit");
    const physical = template.tiers.find((tier) => tier.tier === "printed_board_cards");
    const premium = template.tiers.find((tier) => tier.tier === "premium_gift_box");
    const requiredVendorComponents = template.vendorComponents.filter(
      (component) => component.requiredForQuotes,
    );

    if (template.status === "available") {
      add("pass", "Catalog", `${template.name} is available.`);
    } else {
      add("fail", "Catalog", `${template.name} is not available.`);
    }

    if (digital?.enabled && physical?.enabled && premium && !premium.enabled) {
      add("pass", "Catalog", `${template.name} launch tiers are correct.`);
    } else {
      add("fail", "Catalog", `${template.name} launch tiers are misconfigured.`);
    }

    if (requiredVendorComponents.length >= 6 && requiredVendorComponents.every((item) => item.envKey)) {
      add("pass", "Fulfillment", `${template.name} has a component SKU map.`);
    } else {
      add("fail", "Fulfillment", `${template.name} is missing required vendor component SKUs.`);
    }

    checkFile(
      "Showcase",
      path.join(root, "public", "template-showcase", `${template.slug}.png`),
      500_000,
    );
  }
}

function checkLocalArtifacts() {
  checkFile("Project", path.join(root, "package.json"));
  checkFile("Project", path.join(root, ".replit"));
  checkFile("Project", path.join(root, "prisma", "schema.prisma"));
  checkFile("Project", path.join(root, "components", "shared", "example-board-image.tsx"));

  const tempShowcase = path.join(root, "public", "template-showcase", "face-card.tmp.png");

  if (existsSync(tempShowcase)) {
    add(
      "warn",
      "Cleanup",
      "A local ignored temp image still exists.",
      "public/template-showcase/face-card.tmp.png can be removed after Windows/OneDrive releases the file handle.",
    );
  }
}

function checkLaunchEnv() {
  requireEnv("Core env", [
    "DATABASE_URL",
    "NEXT_PUBLIC_APP_URL",
    "ADMIN_PASSWORD",
    "SUPPORT_EMAIL",
    "CRON_SECRET",
  ]);

  requireEnv("Stripe", [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ]);

  requireEnv("OpenAI", ["OPENAI_API_KEY"]);

  if (env("OPENAI_IMAGE_MODEL") === "gpt-image-2") {
    add("pass", "OpenAI", "OPENAI_IMAGE_MODEL is gpt-image-2.");
  } else {
    add("fail", "OpenAI", "OPENAI_IMAGE_MODEL must be gpt-image-2 for launch.");
  }

  requireEnv("Storage", ["REPLIT_APP_STORAGE_BUCKET_ID"]);
  requireEnv("The Game Crafter", ["TGC_API_KEY_ID", "TGC_USERNAME", "TGC_PASSWORD", "TGC_PAYMENT_METHOD"]);

  const vendorEnvKeys = listTemplateDefinitions()
    .flatMap((template) => template.vendorComponents)
    .map((component) => component.envKey)
    .filter((key): key is string => Boolean(key));

  requireEnv("The Game Crafter", vendorEnvKeys);
  requireEnv("Email", ["RESEND_API_KEY", "EMAIL_FROM"]);
  requireEnv("Bot protection", ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"]);
  requireEnv("Analytics", ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"]);
  warnEnv("Monitoring", ["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN"]);
}

function printResults() {
  const summary = {
    pass: checks.filter((check) => check.level === "pass").length,
    warn: checks.filter((check) => check.level === "warn").length,
    fail: checks.filter((check) => check.level === "fail").length,
  };

  console.log(`\nGameGift Studio launch readiness (${isLocalMode ? "local" : "strict"})`);
  console.log(`PASS ${summary.pass} | WARN ${summary.warn} | FAIL ${summary.fail}\n`);

  for (const check of checks) {
    const marker = check.level === "pass" ? "PASS" : check.level === "warn" ? "WARN" : "FAIL";
    console.log(`${marker.padEnd(4)}  ${check.area.padEnd(18)} ${check.message}`);

    if (check.detail) {
      console.log(`      ${check.detail}`);
    }
  }

  console.log("");
}

checkTemplates();
checkLocalArtifacts();

if (isLocalMode) {
  warnEnv("Local optional env", ["DATABASE_URL", "OPENAI_API_KEY", "STRIPE_SECRET_KEY"]);
} else {
  checkLaunchEnv();
}

printResults();

const hasFailures = checks.some((check) => check.level === "fail");

if (hasFailures) {
  process.exitCode = 1;
}
