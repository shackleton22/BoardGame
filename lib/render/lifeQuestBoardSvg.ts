import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

import {
  buildBleedGuides,
  buildLoopPoint,
  decorativeGlyph,
  PALETTES,
} from "@/lib/render/sharedBoard";

export function renderLifeQuestBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.warm;
  const tileRects = output.tiles.map((tile, index) => {
    const point = buildLoopPoint(index, output.tiles.length);
    const width = 156;
    const height = 74;
    const colorByType: Record<string, string> = {
      memory: palette.tile,
      challenge: "#fce7e0",
      reward: "#ecfccb",
      shortcut: "#dbeafe",
      rest: "#ede9fe",
      wildcard: "#fef3c7",
    };

    return `
      <g transform="translate(${point.x}, ${point.y}) rotate(${point.angle})">
        <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="24" fill="${colorByType[tile.type] ?? palette.tile}" stroke="${palette.line}" stroke-width="2.5" />
        <text x="0" y="-6" text-anchor="middle" font-size="19" font-weight="700" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(tile.name)}</text>
        <text x="0" y="16" text-anchor="middle" font-size="12" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(tile.caption)}</text>
        <text x="0" y="31" text-anchor="middle" font-size="11" fill="${palette.accent}" font-weight="700" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} pts</text>
      </g>
    `;
  });

  const path = Array.from({ length: output.tiles.length }, (_, index) =>
    buildLoopPoint(index, output.tiles.length),
  )
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.bg}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="${palette.highlight}" stop-opacity="0.55" />
          <stop offset="100%" stop-color="${palette.highlight}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1600" fill="url(#bg)" rx="36" />
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="0" y="0" width="1600" height="1600" preserveAspectRatio="xMidYMid slice" opacity="0.26" />`
          : ""
      }
      <circle cx="800" cy="760" r="620" fill="url(#glow)" />
      ${buildBleedGuides(mode)}
      <path d="${path} Z" fill="none" stroke="${palette.accentTwo}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="0.18" />
      <path d="${path} Z" fill="none" stroke="${palette.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16 20" />

      <g transform="translate(800 800)">
        <rect x="-290" y="-245" width="580" height="490" rx="42" fill="rgba(255,255,255,0.82)" stroke="${palette.line}" stroke-width="3" />
        <text x="0" y="-126" text-anchor="middle" font-size="58" font-weight="700" fill="${palette.line}" font-family="Georgia, serif">${escapeXml(output.title)}</text>
        <text x="0" y="-74" text-anchor="middle" font-size="24" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(output.subtitle)}</text>
        <text x="0" y="-22" text-anchor="middle" font-size="20" fill="${palette.line}" font-family="system-ui, sans-serif">Made for ${escapeXml(project.recipientName)} for ${escapeXml(project.occasion)}</text>
        <text x="0" y="20" text-anchor="middle" font-size="17" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(output.themeSummary)}</text>
        <text x="0" y="64" text-anchor="middle" font-size="16" fill="${palette.accent}" font-family="system-ui, sans-serif">${escapeXml(output.centerKicker ?? "A keepsake journey worth replaying")}</text>
        <text x="0" y="96" text-anchor="middle" font-size="15" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">Inspired by ${escapeXml(decorativeGlyph(project.visualStyle))}</text>
        <g transform="translate(0 152)">
          ${output.boardSections
            .slice(0, 4)
            .map(
              (section, index) => `
              <g transform="translate(${(index % 2) * 250 - 125}, ${Math.floor(index / 2) * 68 - 10})">
                <text x="0" y="0" text-anchor="middle" font-size="16" font-weight="700" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(section.label)}</text>
                <text x="0" y="24" text-anchor="middle" font-size="12" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(section.description)}</text>
              </g>
            `,
            )
            .join("")}
        </g>
      </g>

      ${tileRects.join("")}
    </svg>
  `.trim();
}
