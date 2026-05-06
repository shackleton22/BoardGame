import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { ProductTier } from "@prisma/client";
import sharp from "sharp";

import { getProductRecipe } from "@/lib/catalog/game-kits";
import { getMockShippingQuotes } from "@/lib/fulfillment/mockProvider";
import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { createProject } from "@/lib/projects";
import { renderCardsPdf } from "@/lib/render/cardsPdf";
import { renderRulesPdf } from "@/lib/render/rulesPdf";
import { getTemplateExampleProofs } from "@/lib/templates/example-proofs";
import { getTemplateDefinition } from "@/lib/templates/registry";

const REPORT_DIR = path.join(process.cwd(), ".tmp", "launch-examples");

const TEST_SHIPPING = {
  fullName: "Launch Test Customer",
  company: undefined,
  addressLine1: "123 Main St",
  addressLine2: undefined,
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "US" as const,
  phoneNumber: "555-555-5555",
};

type TemplateReport = {
  slug: string;
  name: string;
  scenario: string;
  recipientName: string;
  boardPng: string;
  boardPdf: string;
  primaryCardsPdf: string;
  secondaryCardsPdf: string;
  rulesPdf: string;
  digitalPriceCents: number;
  boxedPriceCents: number;
  mockShippingCents: number;
  localFullCheckoutBeforeTaxCents: number;
  localPreviewProjectId: string;
  productionWindow: string;
  piecesIncluded: string[];
  vendorComponents: Array<{
    key: string;
    label: string;
    quantity: number;
    notes: string;
  }>;
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relativeAssetPath(absolutePath: string) {
  return path.relative(REPORT_DIR, absolutePath).replace(/\\/g, "/");
}

async function renderBoardPng(svg: string, outputPath: string) {
  const result = await sharp(Buffer.from(svg)).png({ quality: 100 }).toFile(outputPath);

  if (result.width < 1500 || result.height < 1500) {
    throw new Error(`Board render too small: ${outputPath}`);
  }
}

async function renderBoardPdf(boardPngPath: string, outputPath: string) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const png = await sharp(boardPngPath).resize(3200, 3200).png().toBuffer();
  const image = await pdf.embedPng(png);
  const page = pdf.addPage([792, 792]);

  page.drawImage(image, {
    x: 18,
    y: 18,
    width: 756,
    height: 756,
  });

  await writeFile(outputPath, Buffer.from(await pdf.save()));
}

function assertPriceBook(report: TemplateReport) {
  if (report.digitalPriceCents <= 0 || report.boxedPriceCents <= 0) {
    throw new Error(`${report.name} has an invalid launch price.`);
  }

  if (report.localFullCheckoutBeforeTaxCents !== report.boxedPriceCents + report.mockShippingCents) {
    throw new Error(`${report.name} checkout subtotal does not match product + shipping.`);
  }
}

function assertPhysicalKit(report: TemplateReport) {
  const requiredKeys = ["board", "deck_primary", "deck_secondary", "rulebook", "pieces_kit", "box"];
  const keys = new Set(report.vendorComponents.map((component) => component.key));

  for (const key of requiredKeys) {
    if (!keys.has(key)) {
      throw new Error(`${report.name} is missing physical component: ${key}`);
    }
  }

  if (report.piecesIncluded.length < 4) {
    throw new Error(`${report.name} customer-facing kit summary is too thin.`);
  }
}

async function buildContactSheet(reports: TemplateReport[]) {
  const cell = 560;
  const captionHeight = 112;
  const gap = 30;
  const cols = 3;
  const rows = 2;
  const width = cols * cell + (cols + 1) * gap;
  const height = rows * (cell + captionHeight) + (rows + 1) * gap;
  const composite: sharp.OverlayOptions[] = [];

  for (let index = 0; index < reports.length; index += 1) {
    const report = reports[index];
    const row = Math.floor(index / cols);
    const col = index % cols;
    const left = gap + col * (cell + gap);
    const top = gap + row * (cell + captionHeight + gap);
    const board = await sharp(path.join(REPORT_DIR, report.boardPng))
      .resize(cell, cell)
      .png()
      .toBuffer();
    const caption = Buffer.from(`
      <svg width="${cell}" height="${captionHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f4eee6"/>
        <text x="18" y="38" font-family="Georgia, serif" font-size="30" font-weight="700" fill="#231914">${escapeHtml(report.name)}</text>
        <text x="18" y="70" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#4f443c">Digital ${formatMoney(report.digitalPriceCents)} | Boxed ${formatMoney(report.boxedPriceCents)}</text>
        <text x="18" y="96" font-family="Arial, sans-serif" font-size="15" fill="#6a5f56">Local smoke checkout: ${formatMoney(report.localFullCheckoutBeforeTaxCents)} before tax</text>
      </svg>
    `);

    composite.push({ input: board, left, top });
    composite.push({ input: caption, left, top: top + cell });
  }

  const outputPath = path.join(REPORT_DIR, "all-board-examples.png");
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#f4eee6",
    },
  })
    .composite(composite)
    .png()
    .toFile(outputPath);

  return outputPath;
}

function buildHtmlReport(reports: TemplateReport[]) {
  const cards = reports
    .map(
      (report) => `
        <article class="card">
          <img src="${escapeHtml(report.boardPng)}" alt="${escapeHtml(report.name)} board example" />
          <div class="body">
            <p class="eyebrow">${escapeHtml(report.recipientName)} sample proof</p>
            <h2>${escapeHtml(report.name)}</h2>
            <p>${escapeHtml(report.scenario)}</p>
            <div class="prices">
              <div><strong>Digital</strong><span>${formatMoney(report.digitalPriceCents)}</span></div>
              <div><strong>Boxed</strong><span>${formatMoney(report.boxedPriceCents)}</span></div>
              <div><strong>Local full checkout</strong><span>${formatMoney(report.localFullCheckoutBeforeTaxCents)} before tax</span></div>
            </div>
            <h3>Box includes</h3>
            <ul>${report.piecesIncluded.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <h3>Vendor components</h3>
            <ul>${report.vendorComponents
              .map(
                (component) =>
                  `<li>${component.quantity}x ${escapeHtml(component.label)} - ${escapeHtml(component.notes)}</li>`,
              )
              .join("")}</ul>
            <p class="links">
              <a href="${escapeHtml(report.boardPdf)}">Board PDF</a>
              <a href="${escapeHtml(report.primaryCardsPdf)}">Primary cards</a>
              <a href="${escapeHtml(report.secondaryCardsPdf)}">Secondary cards</a>
              <a href="${escapeHtml(report.rulesPdf)}">Rules</a>
            </p>
          </div>
        </article>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GameGift Studio launch examples</title>
    <style>
      body { margin: 0; background: #f4eee6; color: #231914; font-family: Arial, sans-serif; }
      main { max-width: 1180px; margin: 0 auto; padding: 48px 24px; }
      h1, h2 { font-family: Georgia, serif; }
      h1 { font-size: clamp(42px, 8vw, 92px); line-height: .9; margin: 0 0 16px; }
      .intro { max-width: 720px; color: #61574e; line-height: 1.7; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 26px; margin-top: 36px; }
      .card { background: #fffdf8; border: 1px solid #ded2c3; border-radius: 28px; overflow: hidden; box-shadow: 0 22px 60px rgba(46, 33, 24, .08); }
      img { display: block; width: 100%; height: auto; }
      .body { padding: 24px; }
      .eyebrow { text-transform: uppercase; letter-spacing: .16em; font-size: 11px; font-weight: 800; color: #867568; }
      h2 { font-size: 38px; margin: 8px 0 10px; line-height: .95; }
      h3 { margin: 22px 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .14em; color: #867568; }
      p, li { color: #5c5148; line-height: 1.55; }
      ul { padding-left: 20px; }
      .prices { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 18px; }
      .prices div { border: 1px solid #e2d7c9; border-radius: 16px; padding: 12px; background: #fbf7ef; }
      .prices strong { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #867568; }
      .prices span { display: block; margin-top: 8px; font-weight: 800; color: #231914; }
      .links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
      .links a { border-radius: 999px; background: #183846; color: white; padding: 10px 14px; text-decoration: none; font-size: 13px; font-weight: 800; }
      @media (max-width: 720px) { .prices { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <h1>Launch examples</h1>
      <p class="intro">One generated proof package per launch template. These files were rendered from the same template registry, validation schemas, deterministic board renderers, card PDFs, rules PDFs, fulfillment recipes, and pricing used by the app.</p>
      <section class="grid">${cards}</section>
    </main>
  </body>
</html>`;
}

async function buildTemplateReport() {
  await mkdir(REPORT_DIR, { recursive: true });
  const reports: TemplateReport[] = [];

  for (const example of getTemplateExampleProofs()) {
    const template = getTemplateDefinition(example.slug);
    const templateDir = path.join(REPORT_DIR, example.slug);
    await mkdir(templateDir, { recursive: true });

    const boardPngPath = path.join(templateDir, "board.png");
    const boardPdfPath = path.join(templateDir, "board_final.pdf");
    const primaryCardsPdfPath = path.join(templateDir, "primary_cards.pdf");
    const secondaryCardsPdfPath = path.join(templateDir, "secondary_cards.pdf");
    const rulesPdfPath = path.join(templateDir, "rules.pdf");

    await renderBoardPng(example.showcaseSvg, boardPngPath);
    await renderBoardPdf(boardPngPath, boardPdfPath);
    await writeFile(
      primaryCardsPdfPath,
      await renderCardsPdf({
        cards: example.output.deckPrimary,
        label: example.output.deckPrimaryLabel,
        accentHex: "#ca6f4b",
        recipientName: example.recipientName,
      }),
    );
    await writeFile(
      secondaryCardsPdfPath,
      await renderCardsPdf({
        cards: example.output.deckSecondary,
        label: example.output.deckSecondaryLabel,
        accentHex: "#264653",
        recipientName: example.recipientName,
      }),
    );
    await writeFile(
      rulesPdfPath,
      await renderRulesPdf({
        output: example.output,
        project: {
          recipientName: example.recipientName,
          occasion: example.occasion,
        },
      }),
    );

    const digitalTier = template.tiers.find((tier) => tier.tier === ProductTier.digital_print_kit);
    const boxedTier = template.tiers.find((tier) => tier.tier === ProductTier.printed_board_cards);
    const recipe = getProductRecipe({
      templateSlug: example.slug,
      productTier: ProductTier.printed_board_cards,
    });
    const localPreviewProject = await createProject(example.inputJson);
    const localPreviewOutput = localPreviewProject.outputJson as {
      tiles?: unknown[];
      deckPrimary?: unknown[];
      deckSecondary?: unknown[];
    };
    const fulfillmentPlan = buildFulfillmentPlan({
      templateSlug: example.slug,
      productTier: ProductTier.printed_board_cards,
    });
    const shippingQuotes = await getMockShippingQuotes({
      projectId: `launch-example-${example.slug}`,
      templateSlug: example.slug,
      productTier: ProductTier.printed_board_cards,
      shipping: TEST_SHIPPING,
      email: "launch-test@example.com",
      fulfillmentPlan,
    });
    const shippingQuote = shippingQuotes.quotes[0];

    if (!digitalTier || !boxedTier || !recipe || !shippingQuote) {
      throw new Error(`${template.name} is missing a launch tier, recipe, or shipping quote.`);
    }

    if (
      localPreviewProject.templateSlug !== example.slug ||
      localPreviewOutput.tiles?.length !== 32 ||
      localPreviewOutput.deckPrimary?.length !== 24 ||
      localPreviewOutput.deckSecondary?.length !== 24
    ) {
      throw new Error(`${template.name} failed local project preview creation.`);
    }

    const report: TemplateReport = {
      slug: example.slug,
      name: template.name,
      scenario: example.scenario,
      recipientName: example.recipientName,
      boardPng: relativeAssetPath(boardPngPath),
      boardPdf: relativeAssetPath(boardPdfPath),
      primaryCardsPdf: relativeAssetPath(primaryCardsPdfPath),
      secondaryCardsPdf: relativeAssetPath(secondaryCardsPdfPath),
      rulesPdf: relativeAssetPath(rulesPdfPath),
      digitalPriceCents: digitalTier.amount,
      boxedPriceCents: boxedTier.amount,
      mockShippingCents: shippingQuote.amount,
      localFullCheckoutBeforeTaxCents: boxedTier.amount + shippingQuote.amount,
      localPreviewProjectId: localPreviewProject.id,
      productionWindow: `${template.productionWindow.minDays}-${template.productionWindow.maxDays} business days production`,
      piecesIncluded: recipe.customerFacingSummary,
      vendorComponents: fulfillmentPlan.components,
    };

    assertPriceBook(report);
    assertPhysicalKit(report);
    reports.push(report);
  }

  const contactSheet = await buildContactSheet(reports);
  await writeFile(path.join(REPORT_DIR, "report.json"), JSON.stringify(reports, null, 2));
  await writeFile(path.join(REPORT_DIR, "index.html"), buildHtmlReport(reports));

  console.log(`Generated launch example report: ${path.join(REPORT_DIR, "index.html")}`);
  console.log(`Generated board contact sheet: ${contactSheet}`);
  console.table(
    reports.map((report) => ({
      template: report.name,
      digital: formatMoney(report.digitalPriceCents),
      boxed: formatMoney(report.boxedPriceCents),
      "local checkout": formatMoney(report.localFullCheckoutBeforeTaxCents),
      pieces: report.vendorComponents.length,
    })),
  );
}

buildTemplateReport().catch((error) => {
  console.error(error);
  process.exit(1);
});
