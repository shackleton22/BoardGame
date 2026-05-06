import {
  buildBleedGuides,
  PALETTES,
  truncateBoardText,
} from "@/lib/render/sharedBoard";
import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

const CARD_COLORS = [
  "#d76735",
  "#2f7d8a",
  "#d5a23a",
  "#694f9a",
  "#4f8a5b",
  "#b95266",
];

function faceCard({
  x,
  y,
  index,
  name,
  caption,
}: {
  x: number;
  y: number;
  index: number;
  name: string;
  caption: string;
}) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const hair = ["#2e2118", "#6b3f1f", "#121212", "#b98041", "#4a3025"][index % 5];
  const shirt = ["#183b4a", "#7a372f", "#2f5b3a", "#5a4278", "#70491e"][index % 5];

  return `
    <g>
      <rect x="${x}" y="${y}" width="185" height="218" rx="20" fill="#fffaf0" stroke="#151515" stroke-width="4" />
      <rect x="${x + 12}" y="${y + 12}" width="161" height="134" rx="15" fill="${color}" opacity="0.9" />
      <circle cx="${x + 92}" cy="${y + 68}" r="34" fill="#d7b38a" />
      <path d="M ${x + 56} ${y + 62} C ${x + 60} ${y + 20}, ${x + 124} ${y + 20}, ${x + 128} ${y + 62} C ${x + 110} ${y + 48}, ${x + 78} ${y + 48}, ${x + 56} ${y + 62} Z" fill="${hair}" />
      <path d="M ${x + 45} ${y + 146} C ${x + 55} ${y + 106}, ${x + 129} ${y + 106}, ${x + 142} ${y + 146} Z" fill="${shirt}" />
      <circle cx="${x + 81}" cy="${y + 71}" r="3.5" fill="#171717" />
      <circle cx="${x + 104}" cy="${y + 71}" r="3.5" fill="#171717" />
      <path d="M ${x + 79} ${y + 91} C ${x + 88} ${y + 99}, ${x + 100} ${y + 99}, ${x + 109} ${y + 91}" fill="none" stroke="#6c412c" stroke-width="3" stroke-linecap="round" />
      <text x="${x + 92}" y="${y + 173}" text-anchor="middle" font-size="17" font-weight="900" fill="#181818" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(name, 18).toUpperCase())}</text>
      <text x="${x + 92}" y="${y + 197}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#4a3f36" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(caption, 26))}</text>
    </g>
  `;
}

function deckPanel({
  x,
  y,
  title,
  color,
}: {
  x: number;
  y: number;
  title: string;
  color: string;
}) {
  return `
    <g transform="translate(${x} ${y}) rotate(-5)">
      <rect x="0" y="0" width="210" height="134" rx="15" fill="${color}" stroke="#fff5d8" stroke-width="7" />
      <text x="105" y="68" text-anchor="middle" font-size="21" font-weight="900" fill="#fff5d8" font-family="system-ui, sans-serif">${escapeXml(title.toUpperCase())}</text>
    </g>
  `;
}

export function renderFaceCardBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.bright;
  const cards = Array.from({ length: 24 }, (_, index) => {
    const tile = output.tiles[index % output.tiles.length];
    const col = index % 6;
    const row = Math.floor(index / 6);
    return faceCard({
      x: 236 + col * 207,
      y: 310 + row * 242,
      index,
      name: tile.name,
      caption: tile.caption,
    });
  }).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <radialGradient id="faceBoardGlow" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stop-color="#fff8df" />
          <stop offset="100%" stop-color="#d7e9ef" />
        </radialGradient>
        <filter id="faceShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#1b1712" flood-opacity="0.22" />
        </filter>
      </defs>

      <rect width="1600" height="1600" fill="#112a34" />
      <rect x="42" y="42" width="1516" height="1516" rx="36" fill="url(#faceBoardGlow)" stroke="#101010" stroke-width="7" />
      ${buildBleedGuides(mode)}
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="42" y="42" width="1516" height="1516" preserveAspectRatio="xMidYMid slice" opacity="0.32" />`
          : ""
      }

      <text x="800" y="130" text-anchor="middle" font-size="76" font-weight="900" letter-spacing="0.02em" fill="#111" font-family="Georgia, serif">${escapeXml(truncateBoardText(output.title, 32).toUpperCase())}</text>
      <text x="800" y="178" text-anchor="middle" font-size="24" font-weight="800" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.subtitle, 72))}</text>
      <text x="800" y="223" text-anchor="middle" font-size="18" fill="#3b3028" font-family="system-ui, sans-serif">Made for ${escapeXml(project.recipientName)} - ask, eliminate, reveal.</text>

      <g filter="url(#faceShadow)">
        <rect x="190" y="270" width="1240" height="1020" rx="34" fill="rgba(255,255,255,0.62)" stroke="#141414" stroke-width="4" />
        ${cards}
      </g>

      <g>
        <rect x="56" y="300" width="126" height="760" rx="22" fill="#101a1f" stroke="#d0a24f" stroke-width="4" />
        <text x="119" y="358" text-anchor="middle" font-size="17" font-weight="900" fill="#fff5d8" font-family="system-ui, sans-serif">ASK</text>
        ${output.boardSections
          .slice(0, 4)
          .map(
            (section, index) => `
              <g transform="translate(118 ${430 + index * 145})">
                <circle cx="0" cy="-24" r="30" fill="${CARD_COLORS[index]}" />
                <text x="0" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#fff5d8" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(section.label, 12).toUpperCase())}</text>
              </g>
            `,
          )
          .join("")}
      </g>

      <g filter="url(#faceShadow)">
        ${deckPanel({ x: 285, y: 1355, title: output.deckPrimaryLabel, color: "#244c62" })}
        ${deckPanel({ x: 1050, y: 1352, title: output.deckSecondaryLabel, color: "#8a4e35" })}
        <rect x="548" y="1330" width="500" height="150" rx="24" fill="#fffaf0" stroke="#111" stroke-width="4" />
        <text x="798" y="1386" text-anchor="middle" font-size="25" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.centerKicker ?? output.themeSummary, 46))}</text>
        <text x="798" y="1432" text-anchor="middle" font-size="16" fill="#4a3f36" font-family="system-ui, sans-serif">Use coins or included markers to cover eliminated faces.</text>
      </g>
    </svg>
  `.trim();
}
