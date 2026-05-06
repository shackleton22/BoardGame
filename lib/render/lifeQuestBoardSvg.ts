import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

import {
  buildBleedGuides,
  PALETTES,
  truncateBoardText,
} from "@/lib/render/sharedBoard";

const SPACE_COLORS: Record<string, string> = {
  memory: "#fff7df",
  challenge: "#f4c7b8",
  reward: "#dff0c2",
  shortcut: "#cfe5f4",
  rest: "#e9ddf6",
  wildcard: "#f8df8d",
};

function pathPoint(index: number) {
  const segment = Math.floor(index / 8);
  const rawCol = index % 8;
  const col = segment % 2 === 0 ? rawCol : 7 - rawCol;
  const x = 245 + col * 160;
  const baseY = [300, 525, 1075, 1300][segment] ?? 300;

  return {
    x,
    y: baseY + Math.sin(index * 0.9) * 24,
    angle: segment % 2 === 0 ? -3 : 3,
  };
}

function roadPath() {
  return Array.from({ length: 32 }, (_, index) => {
    const point = pathPoint(index);
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");
}

function journeySpace(tile: BoardRenderArgs["output"]["tiles"][number], index: number) {
  const point = pathPoint(index);
  const fill = SPACE_COLORS[tile.type] ?? "#fffdf4";

  return `
    <g transform="translate(${point.x} ${point.y}) rotate(${point.angle})">
      <rect x="-70" y="-44" width="140" height="88" rx="20" fill="${fill}" stroke="#211b16" stroke-width="3" />
      <circle cx="-48" cy="-22" r="12" fill="#ffffff" opacity="0.75" />
      <text x="0" y="-6" text-anchor="middle" font-size="16" font-weight="900" fill="#211b16" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(tile.name, 17).toUpperCase())}</text>
      <text x="0" y="17" text-anchor="middle" font-size="10.5" fill="#4b3e34" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(tile.caption, 25))}</text>
      <text x="0" y="34" text-anchor="middle" font-size="10.5" font-weight="900" fill="#b85c38" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} KEEPSAKE</text>
    </g>
  `;
}

function scrapbookScene({
  x,
  y,
  w,
  h,
  type,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "mountain" | "city" | "home" | "coast";
}) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff7e4" stroke="#201a14" stroke-width="3" />
      <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="12" fill="${type === "coast" ? "#bdd9e8" : type === "city" ? "#c9d4da" : "#e6d6ad"}" />
      ${
        type === "mountain"
          ? `<path d="M ${x + 20} ${y + h - 24} L ${x + 94} ${y + 50} L ${x + 160} ${y + h - 24} Z M ${x + 135} ${y + h - 24} L ${x + 230} ${y + 38} L ${x + w - 25} ${y + h - 24} Z" fill="#f7f1df" opacity="0.8" /><path d="M ${x + 18} ${y + h - 36} C ${x + 100} ${y + h - 80}, ${x + 190} ${y + h - 50}, ${x + w - 20} ${y + h - 92}" fill="none" stroke="#66835f" stroke-width="16" stroke-linecap="round" />`
          : type === "city"
            ? `<rect x="${x + 34}" y="${y + 58}" width="38" height="${h - 94}" fill="#40515c" /><rect x="${x + 88}" y="${y + 38}" width="48" height="${h - 74}" fill="#647681" /><rect x="${x + 154}" y="${y + 74}" width="40" height="${h - 110}" fill="#35444c" /><rect x="${x + 218}" y="${y + 52}" width="52" height="${h - 88}" fill="#73838b" />`
            : type === "home"
              ? `<path d="M ${x + 70} ${y + 128} L ${x + w / 2} ${y + 58} L ${x + w - 70} ${y + 128} Z" fill="#874c35" /><rect x="${x + 104}" y="${y + 125}" width="${w - 208}" height="${h - 168}" fill="#f8ead2" /><rect x="${x + w / 2 - 22}" y="${y + h - 86}" width="44" height="44" fill="#5b3826" />`
              : `<path d="M ${x + 8} ${y + h - 72} C ${x + 90} ${y + h - 128}, ${x + 172} ${y + h - 48}, ${x + w - 12} ${y + h - 98}" fill="none" stroke="#fff9d5" stroke-width="18" /><circle cx="${x + w - 66}" cy="${y + 58}" r="24" fill="#f0b45a" />`
      }
    </g>
  `;
}

export function renderLifeQuestBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.warm;
  const path = roadPath();
  const spaces = Array.from({ length: 32 }, (_, index) =>
    journeySpace(output.tiles[index % output.tiles.length], index),
  ).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <radialGradient id="journeyBg" cx="50%" cy="47%" r="74%">
          <stop offset="0%" stop-color="#fff9e8" />
          <stop offset="100%" stop-color="${palette.bg}" />
        </radialGradient>
        <filter id="journeyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#24180f" flood-opacity="0.18" />
        </filter>
      </defs>

      <rect width="1600" height="1600" fill="#20343b" />
      <rect x="42" y="42" width="1516" height="1516" rx="36" fill="url(#journeyBg)" stroke="#171717" stroke-width="7" />
      ${buildBleedGuides(mode)}
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="42" y="42" width="1516" height="1516" preserveAspectRatio="xMidYMid slice" opacity="0.35" />`
          : ""
      }

      ${scrapbookScene({ x: 210, y: 640, w: 310, h: 252, type: "city" })}
      ${scrapbookScene({ x: 1080, y: 640, w: 310, h: 252, type: "mountain" })}
      ${scrapbookScene({ x: 212, y: 884, w: 300, h: 176, type: "home" })}
      ${scrapbookScene({ x: 1088, y: 884, w: 298, h: 176, type: "coast" })}

      <g filter="url(#journeyShadow)">
        <path d="${path}" fill="none" stroke="#26221d" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" opacity="0.2" />
        <path d="${path}" fill="none" stroke="${palette.accent}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${path}" fill="none" stroke="#fff7e4" stroke-width="5" stroke-dasharray="20 20" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
        ${spaces}
      </g>

      <g filter="url(#journeyShadow)">
        <rect x="488" y="650" width="624" height="332" rx="30" fill="#fffaf0" stroke="#171717" stroke-width="5" />
        <rect x="532" y="700" width="536" height="76" fill="${palette.accent}" stroke="#171717" stroke-width="3" />
        <text x="800" y="753" text-anchor="middle" font-size="34" font-weight="900" fill="#fff7e4" font-family="Georgia, serif">${escapeXml(truncateBoardText(output.title, 28).toUpperCase())}</text>
        <text x="800" y="817" text-anchor="middle" font-size="23" font-weight="800" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.subtitle, 62))}</text>
        <text x="800" y="862" text-anchor="middle" font-size="18" fill="#4b3e34" font-family="system-ui, sans-serif">Made for ${escapeXml(project.recipientName)} - ${escapeXml(project.occasion)}</text>
        <text x="800" y="910" text-anchor="middle" font-size="16" fill="#4b3e34" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.themeSummary, 72))}</text>
      </g>

      <g transform="translate(1240 455)" filter="url(#journeyShadow)">
        <circle cx="0" cy="0" r="96" fill="#fffaf0" stroke="#171717" stroke-width="5" />
        <path d="M 0 -78 L 24 -8 L 76 0 L 24 8 Z" fill="${palette.accent}" />
        <text x="0" y="126" text-anchor="middle" font-size="18" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">SPINNER</text>
      </g>

      <g transform="translate(360 452) rotate(-8)" filter="url(#journeyShadow)">
        <rect x="-120" y="-74" width="240" height="148" rx="16" fill="#244d61" stroke="#fff7e4" stroke-width="8" />
        <text x="0" y="-8" text-anchor="middle" font-size="24" font-weight="900" fill="#fff7e4" font-family="system-ui, sans-serif">${escapeXml(output.deckPrimaryLabel.toUpperCase())}</text>
        <text x="0" y="34" text-anchor="middle" font-size="42" fill="#fff7e4" font-family="Georgia, serif">+</text>
      </g>
    </svg>
  `.trim();
}
