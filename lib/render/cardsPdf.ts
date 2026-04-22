import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { ProjectOutputPayload } from "@/lib/validation/project";
import { chunk } from "@/lib/utils";

export async function renderCardsPdf(args: {
  cards: ProjectOutputPayload["deckPrimary"];
  label: string;
  accentHex: string;
  recipientName: string;
}) {
  const pdf = await PDFDocument.create();
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = chunk(args.cards, 6);

  const hex = args.accentHex.replace("#", "");
  const accent = rgb(
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  );

  for (const pageCards of pages) {
    const page = pdf.addPage([612, 792]);
    const margin = 36;
    const cardWidth = 252;
    const cardHeight = 214;
    const gutter = 18;

    page.drawText(`${args.label} for ${args.recipientName}`, {
      x: margin,
      y: 760,
      size: 16,
      font: serif,
      color: rgb(0.22, 0.2, 0.18),
    });

    pageCards.forEach((card, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + column * (cardWidth + gutter);
      const y = 708 - row * (cardHeight + gutter);

      page.drawRectangle({
        x,
        y: y - cardHeight,
        width: cardWidth,
        height: cardHeight,
        borderColor: rgb(0.55, 0.49, 0.44),
        borderWidth: 1,
      });

      page.drawRectangle({
        x: x + 12,
        y: y - 42,
        width: cardWidth - 24,
        height: 26,
        color: accent,
      });

      page.drawText(args.label.toUpperCase(), {
        x: x + 20,
        y: y - 34,
        size: 11,
        font: sans,
        color: rgb(1, 1, 1),
      });

      page.drawText(card.title, {
        x: x + 18,
        y: y - 70,
        size: 15,
        font: serif,
        maxWidth: cardWidth - 36,
        lineHeight: 16,
        color: rgb(0.18, 0.18, 0.18),
      });

      page.drawText(card.body, {
        x: x + 18,
        y: y - 108,
        size: 11,
        font: sans,
        maxWidth: cardWidth - 36,
        lineHeight: 14,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(card.effect, {
        x: x + 18,
        y: y - 176,
        size: 11,
        font: sans,
        maxWidth: cardWidth - 36,
        lineHeight: 14,
        color: accent,
      });

      page.drawLine({
        start: { x, y: y - cardHeight / 2 },
        end: { x: x - 12, y: y - cardHeight / 2 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      page.drawLine({
        start: { x: x + cardWidth, y: y - cardHeight / 2 },
        end: { x: x + cardWidth + 12, y: y - cardHeight / 2 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
    });
  }

  return Buffer.from(await pdf.save());
}
