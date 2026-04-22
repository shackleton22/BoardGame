import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { APP_NAME } from "@/lib/constants";
import type { ProjectOutputPayload } from "@/lib/validation/project";

export async function renderRulesPdf(args: {
  output: ProjectOutputPayload;
  project: { recipientName: string; occasion: string };
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const titleFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const margin = 50;

  page.drawText(args.output.title, {
    x: margin,
    y: 730,
    size: 24,
    font: titleFont,
    color: rgb(0.21, 0.19, 0.18),
  });

  page.drawText(`Made for ${args.project.recipientName} for ${args.project.occasion}`, {
    x: margin,
    y: 700,
    size: 13,
    font: bodyFont,
    color: rgb(0.45, 0.33, 0.24),
  });

  page.drawText("How to play", {
    x: margin,
    y: 658,
    size: 16,
    font: titleFont,
    color: rgb(0.19, 0.19, 0.19),
  });

  const drawBlock = (heading: string, lines: string[], startY: number) => {
    page.drawText(heading, {
      x: margin,
      y: startY,
      size: 14,
      font: titleFont,
      color: rgb(0.28, 0.28, 0.28),
    });

    lines.forEach((line, index) => {
      page.drawText(`• ${line}`, {
        x: margin + 4,
        y: startY - 24 - index * 18,
        size: 11,
        font: bodyFont,
        maxWidth: 500,
        lineHeight: 14,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
  };

  drawBlock("Objective", [args.output.rules.objective], 628);
  drawBlock("Setup", args.output.rules.setup, 550);
  drawBlock("Turn", args.output.rules.turn, 448);
  drawBlock("Winning", [args.output.rules.winning], 332);
  drawBlock(
    "Token note",
    ["Use coins, buttons, figurines, or keepsakes as player tokens."],
    250,
  );

  page.drawText(`${APP_NAME} · Giftable custom board games`, {
    x: margin,
    y: 40,
    size: 10,
    font: bodyFont,
    color: rgb(0.48, 0.48, 0.48),
  });

  return Buffer.from(await pdf.save());
}
