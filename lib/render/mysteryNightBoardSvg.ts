import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

import {
  buildBleedGuides,
  buildLoopPoint,
  PALETTES,
} from "@/lib/render/sharedBoard";

function buildMysteryPoint(index: number, total: number) {
  const base = buildLoopPoint(index, total, -20, 35);
  return {
    x: base.x + Math.sin(index * 0.8) * 46,
    y: base.y + Math.cos(index * 0.6) * 28,
    angle: base.angle - 10,
  };
}

export function renderMysteryNightBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.muted;
  const points = output.tiles.map((_, index) => buildMysteryPoint(index, output.tiles.length));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const tiles = output.tiles.map((tile, index) => {
    const point = points[index];
    const fillByType: Record<string, string> = {
      clue: "#f7f0e8",
      twist: "#f3d7ce",
      alibi: "#e3ecf3",
      reveal: "#fae7a0",
      bonus: "#e6f6df",
      challenge: "#efe3fb",
    };

    return `
      <g transform="translate(${point.x}, ${point.y}) rotate(${point.angle})">
        <rect x="-72" y="-48" width="144" height="96" rx="12" fill="${fillByType[tile.type] ?? "#fffdf8"}" stroke="${palette.line}" stroke-width="2.4" />
        <circle cx="-48" cy="-28" r="6" fill="${palette.accent}" />
        <text x="0" y="-8" text-anchor="middle" font-size="17" font-weight="700" fill="${palette.line}" font-family="Georgia, serif">${escapeXml(tile.name)}</text>
        <text x="0" y="16" text-anchor="middle" font-size="11" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(tile.caption)}</text>
        <text x="0" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} case pts</text>
      </g>
    `;
  });

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <linearGradient id="mysteryBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#efe7dd" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <radialGradient id="mysteryGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="${palette.highlight}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${palette.highlight}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1600" fill="url(#mysteryBg)" rx="36" />
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="0" y="0" width="1600" height="1600" preserveAspectRatio="xMidYMid slice" opacity="0.18" />`
          : ""
      }
      ${buildBleedGuides(mode)}
      <rect x="90" y="90" width="1420" height="1420" rx="28" fill="rgba(255,253,249,0.72)" stroke="${palette.line}" stroke-width="2.6" />
      <rect x="170" y="170" width="1260" height="1260" rx="22" fill="rgba(227, 212, 193, 0.14)" stroke="${palette.line}" stroke-dasharray="12 12" />
      <circle cx="800" cy="800" r="540" fill="url(#mysteryGlow)" />
      <path d="${path} Z" fill="none" stroke="${palette.accentTwo}" stroke-width="10" stroke-linecap="round" stroke-dasharray="5 18" opacity="0.85" />
      <path d="${path} Z" fill="none" stroke="${palette.accent}" stroke-width="26" stroke-linecap="round" opacity="0.08" />

      <g transform="translate(800 800)">
        <rect x="-310" y="-236" width="620" height="472" rx="24" fill="rgba(255,255,255,0.88)" stroke="${palette.line}" stroke-width="3" />
        <text x="0" y="-128" text-anchor="middle" font-size="56" font-weight="700" fill="${palette.line}" font-family="Georgia, serif">${escapeXml(output.title)}</text>
        <text x="0" y="-80" text-anchor="middle" font-size="23" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(output.subtitle)}</text>
        <text x="0" y="-30" text-anchor="middle" font-size="18" fill="${palette.line}" font-family="system-ui, sans-serif">Case file for ${escapeXml(project.recipientName)} · ${escapeXml(project.occasion)}</text>
        <text x="0" y="10" text-anchor="middle" font-size="17" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(output.themeSummary)}</text>
        <text x="0" y="56" text-anchor="middle" font-size="16" fill="${palette.accent}" font-family="system-ui, sans-serif">${escapeXml(output.centerKicker ?? "Every clue is suspiciously familiar")}</text>
        <g transform="translate(0 118)">
          ${output.boardSections
            .slice(0, 4)
            .map(
              (section, index) => `
                <g transform="translate(${(index % 2) * 270 - 135}, ${Math.floor(index / 2) * 82 - 10})">
                  <rect x="-110" y="-18" width="220" height="48" rx="8" fill="rgba(255,249,242,0.96)" stroke="${palette.line}" stroke-width="1.6" />
                  <text x="0" y="-1" text-anchor="middle" font-size="15" font-weight="700" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(section.label)}</text>
                  <text x="0" y="17" text-anchor="middle" font-size="11" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(section.description)}</text>
                </g>
              `,
            )
            .join("")}
        </g>
      </g>

      ${tiles.join("")}
    </svg>
  `.trim();
}
