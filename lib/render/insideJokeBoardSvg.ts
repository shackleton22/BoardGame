import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

import {
  buildBleedGuides,
  PALETTES,
  truncateBoardText,
} from "@/lib/render/sharedBoard";

const COLORS = ["#d95f3d", "#2f7d8a", "#d2a438", "#6f559d", "#4d8b58", "#c05673"];

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function sectorPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number) {
  const p1 = polar(cx, cy, outer, start);
  const p2 = polar(cx, cy, outer, end);
  const p3 = polar(cx, cy, inner, end);
  const p4 = polar(cx, cy, inner, start);
  const large = end - start > 180 ? 1 : 0;

  return `M ${p1.x} ${p1.y} A ${outer} ${outer} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${inner} ${inner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

function triviaSpace(tile: BoardRenderArgs["output"]["tiles"][number], index: number) {
  const point = polar(800, 810, 570, index * (360 / 32));
  const color = COLORS[index % COLORS.length];

  return `
    <g transform="translate(${point.x} ${point.y}) rotate(${index * (360 / 32)})">
      <rect x="-73" y="-38" width="146" height="76" rx="18" fill="#fffdf4" stroke="#151515" stroke-width="3" />
      <rect x="-73" y="-38" width="146" height="16" rx="8" fill="${color}" />
      <text x="0" y="-1" text-anchor="middle" font-size="14" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(tile.name, 16).toUpperCase())}</text>
      <text x="0" y="21" text-anchor="middle" font-size="10" fill="#41382f" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(tile.caption, 24))}</text>
      <text x="0" y="34" text-anchor="middle" font-size="10" font-weight="900" fill="${color}" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} SCORE</text>
    </g>
  `;
}

function promptCard({
  x,
  y,
  rotate,
  label,
  color,
}: {
  x: number;
  y: number;
  rotate: number;
  label: string;
  color: string;
}) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})">
      <rect x="-115" y="-72" width="230" height="144" rx="16" fill="${color}" stroke="#fff5d8" stroke-width="8" />
      <text x="0" y="-5" text-anchor="middle" font-size="22" font-weight="900" fill="#fff5d8" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(label, 18).toUpperCase())}</text>
      <text x="0" y="31" text-anchor="middle" font-size="54" font-weight="900" fill="#fff5d8" font-family="Georgia, serif">?</text>
    </g>
  `;
}

export function renderInsideJokeBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.bright;
  const wedges = output.boardSections
    .slice(0, 6)
    .map((section, index) => {
      const start = index * 60;
      const end = start + 60;
      const labelPoint = polar(800, 810, 245, start + 30);

      return `
        <path d="${sectorPath(800, 810, 120, 360, start, end)}" fill="${COLORS[index % COLORS.length]}" stroke="#fff8e8" stroke-width="5" />
        <text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" font-size="18" font-weight="900" fill="#fffdf4" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(section.label, 16).toUpperCase())}</text>
      `;
    })
    .join("");
  const spaces = Array.from({ length: 32 }, (_, index) =>
    triviaSpace(output.tiles[index % output.tiles.length], index),
  ).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <radialGradient id="triviaBg" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stop-color="#fff8e6" />
          <stop offset="100%" stop-color="#ead7b8" />
        </radialGradient>
        <filter id="triviaShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#241b12" flood-opacity="0.2" />
        </filter>
      </defs>
      <rect width="1600" height="1600" fill="#263d3f" />
      <rect x="42" y="42" width="1516" height="1516" rx="34" fill="url(#triviaBg)" stroke="#111" stroke-width="7" />
      ${buildBleedGuides(mode)}
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="42" y="42" width="1516" height="1516" preserveAspectRatio="xMidYMid slice" opacity="0.35" />`
          : ""
      }

      <text x="800" y="128" text-anchor="middle" font-size="76" font-weight="900" fill="#171717" font-family="Georgia, serif">${escapeXml(truncateBoardText(output.title, 32).toUpperCase())}</text>
      <text x="800" y="178" text-anchor="middle" font-size="24" font-weight="800" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.subtitle, 76))}</text>

      <g filter="url(#triviaShadow)">
        <circle cx="800" cy="810" r="640" fill="rgba(255,255,255,0.44)" stroke="#111" stroke-width="4" />
        <circle cx="800" cy="810" r="410" fill="#fffdf4" stroke="#111" stroke-width="4" />
        ${wedges}
        <circle cx="800" cy="810" r="126" fill="#fffdf4" stroke="#111" stroke-width="5" />
        <text x="800" y="783" text-anchor="middle" font-size="26" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${escapeXml(project.recipientName.toUpperCase())}</text>
        <text x="800" y="824" text-anchor="middle" font-size="54" font-weight="900" fill="${palette.accent}" font-family="Georgia, serif">FINAL</text>
        <text x="800" y="858" text-anchor="middle" font-size="19" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">QUESTION</text>
        ${spaces}
      </g>

      ${promptCard({ x: 305, y: 300, rotate: -12, label: output.deckPrimaryLabel, color: "#2f7d8a" })}
      ${promptCard({ x: 1295, y: 320, rotate: 11, label: output.deckSecondaryLabel, color: "#d95f3d" })}
      ${promptCard({ x: 320, y: 1302, rotate: 10, label: "Speed Round", color: "#6f559d" })}
      ${promptCard({ x: 1282, y: 1298, rotate: -8, label: "Bonus Round", color: "#d2a438" })}

      <rect x="548" y="1312" width="504" height="128" rx="24" fill="#fffdf4" stroke="#111" stroke-width="4" />
      <text x="800" y="1366" text-anchor="middle" font-size="22" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.centerKicker ?? output.themeSummary, 48))}</text>
      <text x="800" y="1406" text-anchor="middle" font-size="15" fill="#4b4036" font-family="system-ui, sans-serif">Roll, answer, score, and race to the final question.</text>
    </svg>
  `.trim();
}
