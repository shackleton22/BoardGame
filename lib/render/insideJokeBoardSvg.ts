import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

import {
  buildBleedGuides,
  buildLoopPoint,
  PALETTES,
} from "@/lib/render/sharedBoard";

function buildPartyPoint(index: number, total: number) {
  const point = buildLoopPoint(index, total, 20, -20);
  return {
    x: point.x + Math.sin(index * 1.1) * 34,
    y: point.y + Math.cos(index * 0.9) * 42,
    angle: point.angle + 8,
  };
}

export function renderInsideJokeBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.bright;
  const points = output.tiles.map((_, index) => buildPartyPoint(index, output.tiles.length));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const tiles = output.tiles.map((tile, index) => {
    const point = points[index];
    const fillByType: Record<string, string> = {
      bonus: "#fff4c1",
      challenge: "#fbe2e5",
      double_down: "#dff2ff",
      reward: "#e7f7d8",
      wildcard: "#f6e6ff",
      shortcut: "#ffe5d0",
      rest: "#fffdf7",
    };

    return `
      <g transform="translate(${point.x}, ${point.y}) rotate(${point.angle})">
        <rect x="-78" y="-38" width="156" height="76" rx="30" fill="${fillByType[tile.type] ?? "#ffffff"}" stroke="${palette.line}" stroke-width="2.2" />
        <text x="0" y="-4" text-anchor="middle" font-size="18" font-weight="700" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(tile.name)}</text>
        <text x="0" y="18" text-anchor="middle" font-size="11" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(tile.caption)}</text>
        <text x="0" y="31" text-anchor="middle" font-size="11" font-weight="700" fill="${palette.accent}" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} laugh pts</text>
      </g>
    `;
  });

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <linearGradient id="partyBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff8ef" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <radialGradient id="partyGlow" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stop-color="${palette.highlight}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${palette.highlight}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1600" fill="url(#partyBg)" rx="36" />
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="0" y="0" width="1600" height="1600" preserveAspectRatio="xMidYMid slice" opacity="0.18" />`
          : ""
      }
      ${buildBleedGuides(mode)}
      <circle cx="800" cy="800" r="580" fill="url(#partyGlow)" />
      <path d="${path} Z" fill="none" stroke="${palette.accent}" stroke-width="16" stroke-linecap="round" stroke-dasharray="28 18" opacity="0.34" />
      <path d="${path} Z" fill="none" stroke="${palette.accentTwo}" stroke-width="8" stroke-linecap="round" stroke-dasharray="6 14" opacity="0.7" />
      <circle cx="240" cy="260" r="48" fill="rgba(255, 211, 105, 0.38)" />
      <circle cx="1340" cy="1240" r="56" fill="rgba(15, 118, 110, 0.18)" />
      <circle cx="1310" cy="320" r="32" fill="rgba(249, 115, 22, 0.22)" />
      <circle cx="290" cy="1290" r="36" fill="rgba(125, 211, 252, 0.32)" />

      <g transform="translate(800 800)">
        <rect x="-320" y="-230" width="640" height="460" rx="48" fill="rgba(255,255,255,0.88)" stroke="${palette.line}" stroke-width="3" />
        <text x="0" y="-116" text-anchor="middle" font-size="54" font-weight="700" fill="${palette.line}" font-family="Georgia, serif">${escapeXml(output.title)}</text>
        <text x="0" y="-70" text-anchor="middle" font-size="24" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(output.subtitle)}</text>
        <text x="0" y="-24" text-anchor="middle" font-size="18" fill="${palette.line}" font-family="system-ui, sans-serif">Showdown for ${escapeXml(project.recipientName)} · ${escapeXml(project.occasion)}</text>
        <text x="0" y="12" text-anchor="middle" font-size="17" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(output.themeSummary)}</text>
        <text x="0" y="54" text-anchor="middle" font-size="16" fill="${palette.accent}" font-family="system-ui, sans-serif">${escapeXml(output.centerKicker ?? "Fast laughs and bigger bragging rights")}</text>
        <g transform="translate(0 120)">
          ${output.boardSections
            .slice(0, 4)
            .map(
              (section, index) => `
                <g transform="translate(${(index % 2) * 270 - 135}, ${Math.floor(index / 2) * 80 - 6})">
                  <rect x="-116" y="-18" width="232" height="46" rx="18" fill="rgba(255,255,255,0.96)" stroke="${palette.line}" stroke-width="1.4" />
                  <text x="0" y="-2" text-anchor="middle" font-size="15" font-weight="700" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(section.label)}</text>
                  <text x="0" y="16" text-anchor="middle" font-size="11" fill="${palette.line}" font-family="system-ui, sans-serif">${escapeXml(section.description)}</text>
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
