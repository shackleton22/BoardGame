import {
  buildBleedGuides,
  PALETTES,
  truncateBoardText,
} from "@/lib/render/sharedBoard";
import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

const OUTER = 62;
const CELL = 164;
const SIDE_CELLS = 9;
const BOARD = CELL * SIDE_CELLS;
const INNER = OUTER + CELL;
const INNER_SIZE = BOARD - CELL * 2;

const BANDS = [
  "#b85c38",
  "#2f6f73",
  "#c69c48",
  "#7a4f8f",
  "#cf6f7b",
  "#3f6f9f",
  "#608f5b",
  "#c27832",
];

function getPerimeterCell(index: number) {
  if (index <= 8) {
    return { x: OUTER + index * CELL, y: OUTER };
  }

  if (index <= 15) {
    return { x: OUTER + 8 * CELL, y: OUTER + (index - 8) * CELL };
  }

  if (index <= 24) {
    return { x: OUTER + (24 - index) * CELL, y: OUTER + 8 * CELL };
  }

  return { x: OUTER, y: OUTER + (32 - index) * CELL };
}

function miniScene({
  x,
  y,
  index,
  label,
}: {
  x: number;
  y: number;
  index: number;
  label: string;
}) {
  const sky = ["#b8d8e8", "#f3d2a0", "#d7e7c7", "#c8d2e8"][index % 4];
  const ground = ["#8aa879", "#d7ad6f", "#6f9bb0", "#9f7b58"][index % 4];

  return `
    <g>
      <rect x="${x}" y="${y}" width="128" height="64" rx="8" fill="${sky}" stroke="#201b16" stroke-width="1.4" opacity="0.96" />
      <rect x="${x}" y="${y + 40}" width="128" height="24" rx="7" fill="${ground}" opacity="0.84" />
      ${
        index % 4 === 0
          ? `<path d="M ${x + 5} ${y + 48} L ${x + 35} ${y + 18} L ${x + 58} ${y + 48} Z M ${x + 46} ${y + 48} L ${x + 82} ${y + 13} L ${x + 120} ${y + 48} Z" fill="#f7f2df" opacity="0.72" />`
          : index % 4 === 1
            ? `<rect x="${x + 16}" y="${y + 20}" width="24" height="30" fill="#43525c" /><rect x="${x + 46}" y="${y + 12}" width="18" height="38" fill="#5f6f7a" /><rect x="${x + 72}" y="${y + 26}" width="28" height="24" fill="#39454e" />`
            : index % 4 === 2
              ? `<path d="M ${x + 12} ${y + 42} C ${x + 38} ${y + 22}, ${x + 74} ${y + 22}, ${x + 116} ${y + 43}" fill="none" stroke="#fff8d9" stroke-width="8" opacity="0.86" /><circle cx="${x + 98}" cy="${y + 17}" r="11" fill="#f6c45d" />`
              : `<path d="M ${x + 16} ${y + 46} L ${x + 48} ${y + 20} L ${x + 82} ${y + 46} Z" fill="#704f3e" /><rect x="${x + 36}" y="${y + 34}" width="28" height="20" fill="#f6ead6" />`
      }
      <text x="${x + 64}" y="${y + 58}" text-anchor="middle" font-size="8" font-weight="800" letter-spacing="0.08em" fill="#201b16" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(label, 16).toUpperCase())}</text>
    </g>
  `;
}

function tileMarkup(
  tile: BoardRenderArgs["output"]["tiles"][number],
  index: number,
  palette: (typeof PALETTES)[keyof typeof PALETTES],
) {
  const { x, y } = getPerimeterCell(index);
  const isCorner = [0, 8, 16, 24].includes(index);
  const band = BANDS[index % BANDS.length];
  const cornerLabels: Record<number, string> = {
    0: "Home Base",
    8: "Story Swap",
    16: "Detour Dock",
    24: "Final Lap",
  };
  const label = cornerLabels[index] ?? tile.name;

  if (isCorner) {
    return `
      <g>
        <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#fff8e8" stroke="#171717" stroke-width="3" />
        <rect x="${x + 12}" y="${y + 12}" width="${CELL - 24}" height="${CELL - 24}" rx="18" fill="${band}" opacity="0.14" stroke="${band}" stroke-width="2" />
        <circle cx="${x + CELL / 2}" cy="${y + 65}" r="31" fill="${band}" opacity="0.92" />
        <path d="M ${x + 66} ${y + 67} C ${x + 82} ${y + 40}, ${x + 103} ${y + 49}, ${x + 97} ${y + 76} C ${x + 92} ${y + 100}, ${x + 69} ${y + 98}, ${x + 66} ${y + 67} Z" fill="#fffdf6" opacity="0.82" />
        <text x="${x + CELL / 2}" y="${y + 123}" text-anchor="middle" font-size="18" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${escapeXml(label.toUpperCase())}</text>
        <text x="${x + CELL / 2}" y="${y + 145}" text-anchor="middle" font-size="10" font-weight="800" fill="${palette.accent}" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} TURF</text>
      </g>
    `;
  }

  return `
    <g>
      <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#fffdf2" stroke="#171717" stroke-width="2.4" />
      <rect x="${x}" y="${y}" width="${CELL}" height="20" fill="${band}" />
      <text x="${x + CELL / 2}" y="${y + 38}" text-anchor="middle" font-size="15" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(tile.name, 18).toUpperCase())}</text>
      ${miniScene({ x: x + 18, y: y + 48, index, label: tile.name })}
      <text x="${x + CELL / 2}" y="${y + 132}" text-anchor="middle" font-size="9.8" fill="#34302a" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(tile.caption, 25))}</text>
      <text x="${x + CELL / 2}" y="${y + 151}" text-anchor="middle" font-size="11" font-weight="900" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} TURF</text>
    </g>
  `;
}

export function renderHomeTurfBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.neutral;
  const tiles = Array.from({ length: 32 }, (_, index) =>
    tileMarkup(output.tiles[index % output.tiles.length], index, palette),
  ).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <radialGradient id="homeGlow" cx="52%" cy="44%" r="70%">
          <stop offset="0%" stop-color="#fff8dd" />
          <stop offset="100%" stop-color="#d9c4a3" />
        </radialGradient>
        <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#1b1712" flood-opacity="0.2" />
        </filter>
      </defs>
      <rect width="1600" height="1600" fill="#151914" />
      <rect x="34" y="34" width="1532" height="1532" rx="20" fill="#f8f0db" stroke="#111" stroke-width="6" />
      ${buildBleedGuides(mode)}
      <rect x="${INNER}" y="${INNER}" width="${INNER_SIZE}" height="${INNER_SIZE}" fill="url(#homeGlow)" stroke="#171717" stroke-width="3" />
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="${INNER}" y="${INNER}" width="${INNER_SIZE}" height="${INNER_SIZE}" preserveAspectRatio="xMidYMid slice" opacity="0.45" />`
          : ""
      }

      <g opacity="0.46">
        <path d="M 316 640 C 470 520, 585 620, 735 500 S 1018 375, 1235 535" fill="none" stroke="#5f7f88" stroke-width="38" stroke-linecap="round" />
        <path d="M 278 1078 C 512 960, 712 1080, 920 928 S 1126 760, 1305 824" fill="none" stroke="#d58b55" stroke-width="32" stroke-linecap="round" />
        <path d="M 287 815 C 455 748, 610 770, 765 705 C 946 627, 1110 646, 1320 590" fill="none" stroke="#384d39" stroke-width="15" stroke-dasharray="28 18" stroke-linecap="round" />
      </g>

      <g filter="url(#paperShadow)">
        <rect x="444" y="560" width="712" height="330" rx="18" fill="#fff9e8" stroke="#231d17" stroke-width="3" />
        <rect x="495" y="618" width="610" height="94" fill="${palette.accent}" stroke="#231d17" stroke-width="3" />
        <text x="800" y="682" text-anchor="middle" font-size="42" font-weight="900" letter-spacing="0.03em" fill="#fff7e6" font-family="Georgia, serif">${escapeXml(truncateBoardText(output.title, 28).toUpperCase())}</text>
        <text x="800" y="750" text-anchor="middle" font-size="28" fill="#33261f" font-family="Georgia, serif">${escapeXml(truncateBoardText(output.subtitle, 60))}</text>
        <text x="800" y="800" text-anchor="middle" font-size="18" font-weight="800" fill="${palette.accentTwo}" font-family="system-ui, sans-serif">Made for ${escapeXml(project.recipientName)} - ${escapeXml(project.occasion)}</text>
        <text x="800" y="842" text-anchor="middle" font-size="16" fill="#514439" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.themeSummary, 76))}</text>
      </g>

      <g transform="translate(330 380) rotate(-14)" filter="url(#paperShadow)">
        <rect x="0" y="0" width="260" height="160" rx="14" fill="#2f6f9f" stroke="#fff7e6" stroke-width="8" />
        <text x="130" y="83" text-anchor="middle" font-size="24" font-weight="900" fill="#fff7e6" font-family="system-ui, sans-serif">DETOUR</text>
      </g>
      <g transform="translate(1005 1000) rotate(-17)" filter="url(#paperShadow)">
        <rect x="0" y="0" width="265" height="166" rx="14" fill="#c27832" stroke="#fff7e6" stroke-width="8" />
        <text x="132" y="90" text-anchor="middle" font-size="22" font-weight="900" fill="#fff7e6" font-family="system-ui, sans-serif">LOCAL LEGEND</text>
      </g>

      <g>
        <text x="520" y="982" font-size="21" font-weight="900" fill="#2d251e" font-family="system-ui, sans-serif">Play for:</text>
        ${output.boardSections
          .slice(0, 4)
          .map(
            (section, index) => `
              <g transform="translate(520 ${1026 + index * 44})">
                <circle cx="0" cy="-6" r="11" fill="${BANDS[index]}" />
                <text x="26" y="0" font-size="18" font-weight="800" fill="#2d251e" font-family="Georgia, serif">${escapeXml(truncateBoardText(section.label, 24))}</text>
              </g>
            `,
          )
          .join("")}
      </g>

      ${tiles}
    </svg>
  `.trim();
}
