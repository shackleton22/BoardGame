import type { TemplateSlug } from "@/lib/templates/types";
import type { ProjectOutputPayload } from "@/lib/validation/project";
import { escapeXml } from "@/lib/utils";

import { truncateBoardText } from "@/lib/render/sharedBoard";

type ShowcaseArgs = {
  slug: TemplateSlug;
  templateName: string;
  recipientName: string;
  occasion: string;
  inputJson?: unknown;
  output: ProjectOutputPayload;
};

const CELL = 150;
const BOARD_X = 50;
const BOARD_Y = 50;
const INNER_X = BOARD_X + CELL;
const INNER_Y = BOARD_Y + CELL;
const INNER_SIZE = CELL * 8;

const TILE_BANDS = [
  "#b44d35",
  "#2c6b78",
  "#d6a43d",
  "#7b4b88",
  "#497f50",
  "#c46b38",
  "#42639b",
  "#8a5a2b",
];

const FACE_COLORS = ["#d66138", "#2d7282", "#d5a23f", "#76549c", "#4f8b58", "#c05673"];

function text(value: string, max: number) {
  return escapeXml(truncateBoardText(value, max));
}

function defs(seed = 8) {
  return `
    <defs>
      <filter id="paperNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="${seed}" result="noise" />
        <feColorMatrix in="noise" type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.08" />
        </feComponentTransfer>
      </filter>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0d0a07" flood-opacity="0.28" />
      </filter>
      <filter id="hardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="9" stdDeviation="5" flood-color="#0d0a07" flood-opacity="0.38" />
      </filter>
      <linearGradient id="linen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff8e8" />
        <stop offset="48%" stop-color="#efe0bd" />
        <stop offset="100%" stop-color="#d5bd91" />
      </linearGradient>
      <linearGradient id="darkFelt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#101817" />
        <stop offset="55%" stop-color="#09100f" />
        <stop offset="100%" stop-color="#1d1711" />
      </linearGradient>
      <radialGradient id="warmSpot" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="#fff4d9" />
        <stop offset="100%" stop-color="#c59d66" />
      </radialGradient>
    </defs>
  `;
}

function cellPosition(index: number) {
  if (index <= 9) return { x: BOARD_X + index * CELL, y: BOARD_Y };
  if (index <= 18) return { x: BOARD_X + 9 * CELL, y: BOARD_Y + (index - 9) * CELL };
  if (index <= 27) return { x: BOARD_X + (27 - index) * CELL, y: BOARD_Y + 9 * CELL };
  return { x: BOARD_X, y: BOARD_Y + (36 - index) * CELL };
}

function miniLandscape(x: number, y: number, w: number, h: number, index: number) {
  const sky = ["#a9d3e7", "#f0c991", "#c6d9ef", "#d9e6bc"][index % 4];
  const low = ["#5f8b64", "#b36c38", "#647f9a", "#8a704a"][index % 4];
  const sunX = x + w - 25;
  const sunY = y + 20;

  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${sky}" />
      <circle cx="${sunX}" cy="${sunY}" r="12" fill="#f6c55d" opacity="0.82" />
      <rect x="${x}" y="${y + h * 0.62}" width="${w}" height="${h * 0.38}" rx="6" fill="${low}" opacity="0.9" />
      ${
        index % 4 === 0
          ? `<path d="M ${x + 6} ${y + h - 9} L ${x + 42} ${y + 25} L ${x + 79} ${y + h - 9} Z M ${x + 54} ${y + h - 9} L ${x + 100} ${y + 18} L ${x + w - 4} ${y + h - 9} Z" fill="#f8f2df" opacity="0.78" />`
          : index % 4 === 1
            ? `<rect x="${x + 15}" y="${y + 28}" width="24" height="${h - 34}" fill="#384851" /><rect x="${x + 50}" y="${y + 14}" width="22" height="${h - 20}" fill="#596a72" /><rect x="${x + 85}" y="${y + 34}" width="30" height="${h - 40}" fill="#2f3b42" />`
            : index % 4 === 2
              ? `<path d="M ${x + 5} ${y + h - 18} C ${x + 35} ${y + h - 54}, ${x + 75} ${y + h - 14}, ${x + w - 5} ${y + h - 48}" fill="none" stroke="#fff7d7" stroke-width="9" stroke-linecap="round" />`
              : `<path d="M ${x + 23} ${y + h - 14} L ${x + 58} ${y + 31} L ${x + 96} ${y + h - 14} Z" fill="#754b32" /><rect x="${x + 42}" y="${y + h - 34}" width="32" height="20" fill="#f6ead2" />`
      }
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="none" stroke="#171717" stroke-width="1.4" opacity="0.5" />
    </g>
  `;
}

function placeTile(tile: ProjectOutputPayload["tiles"][number], index: number) {
  const { x, y } = cellPosition(index);
  const isCorner = index % 9 === 0;
  const band = TILE_BANDS[index % TILE_BANDS.length];
  const title = isCorner
    ? ["START", "STORY STOP", "BONUS LAP", "HOME AGAIN"][Math.floor(index / 9)]
    : tile.name;

  if (isCorner) {
    return `
      <g>
        <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#f8efd7" stroke="#111" stroke-width="3" />
        <rect x="${x + 15}" y="${y + 15}" width="${CELL - 30}" height="${CELL - 30}" rx="15" fill="${band}" opacity="0.14" stroke="${band}" stroke-width="2" />
        <circle cx="${x + CELL / 2}" cy="${y + 58}" r="27" fill="${band}" />
        <path d="M ${x + 61} ${y + 61} C ${x + 78} ${y + 32}, ${x + 102} ${y + 46}, ${x + 94} ${y + 74} C ${x + 89} ${y + 95}, ${x + 66} ${y + 92}, ${x + 61} ${y + 61} Z" fill="#fff8e8" opacity="0.86" />
        <text x="${x + CELL / 2}" y="${y + 113}" text-anchor="middle" font-size="17" font-weight="900" fill="#111" font-family="system-ui, sans-serif">${text(title, 13)}</text>
        <text x="${x + CELL / 2}" y="${y + 136}" text-anchor="middle" font-size="10" font-weight="900" fill="${band}" font-family="system-ui, sans-serif">+${Math.abs(tile.points)} PTS</text>
      </g>
    `;
  }

  return `
    <g>
      <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#fff9e8" stroke="#111" stroke-width="2.5" />
      <rect x="${x}" y="${y}" width="${CELL}" height="18" fill="${band}" />
      <text x="${x + CELL / 2}" y="${y + 37}" text-anchor="middle" font-size="13" font-weight="900" fill="#111" font-family="system-ui, sans-serif">${text(tile.name.toUpperCase(), 15)}</text>
      ${miniLandscape(x + 18, y + 49, CELL - 36, 61, index)}
      <text x="${x + CELL / 2}" y="${y + 130}" text-anchor="middle" font-size="9.5" fill="#332a22" font-family="system-ui, sans-serif">${text(tile.caption, 22)}</text>
      <text x="${x + CELL / 2}" y="${y + 145}" text-anchor="middle" font-size="10" font-weight="900" fill="#111" font-family="system-ui, sans-serif">${tile.points >= 0 ? "+" : ""}${tile.points} PTS</text>
    </g>
  `;
}

function showcaseHomeTurf(args: ShowcaseArgs) {
  const tiles = Array.from({ length: 36 }, (_, index) =>
    placeTile(args.output.tiles[index % args.output.tiles.length], index),
  ).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text(args.output.title, 80)}">
      ${defs(3)}
      <rect width="1600" height="1600" fill="#0d1110" />
      <rect x="18" y="18" width="1564" height="1564" rx="16" fill="url(#linen)" stroke="#0a0a0a" stroke-width="8" />
      <rect x="${INNER_X}" y="${INNER_Y}" width="${INNER_SIZE}" height="${INNER_SIZE}" fill="#e8d1a5" stroke="#111" stroke-width="3" />
      <g opacity="0.78">
        <path d="M 245 630 C 420 500, 525 635, 705 510 S 1010 370, 1265 545" fill="none" stroke="#557d83" stroke-width="42" stroke-linecap="round" opacity="0.55" />
        <path d="M 250 1080 C 470 930, 690 1095, 900 930 S 1125 765, 1342 820" fill="none" stroke="#be7a45" stroke-width="38" stroke-linecap="round" opacity="0.5" />
        <path d="M 275 810 C 450 745, 620 770, 780 690 C 970 607, 1120 644, 1310 585" fill="none" stroke="#314935" stroke-width="14" stroke-dasharray="26 18" stroke-linecap="round" opacity="0.5" />
      </g>
      ${miniLandscape(292, 315, 370, 205, 1)}
      ${miniLandscape(930, 300, 365, 215, 0)}
      ${miniLandscape(290, 1030, 330, 210, 2)}
      ${miniLandscape(980, 1030, 320, 208, 3)}
      <g filter="url(#softShadow)">
        <rect x="462" y="610" width="676" height="310" rx="14" fill="#fff4d7" stroke="#211a13" stroke-width="4" />
        <rect x="488" y="668" width="624" height="84" fill="#a84831" stroke="#211a13" stroke-width="4" />
        <text x="800" y="725" text-anchor="middle" font-size="41" font-weight="900" letter-spacing="0.02em" fill="#fff7e6" font-family="Georgia, serif">${text(args.output.title.toUpperCase(), 30)}</text>
        <text x="800" y="790" text-anchor="middle" font-size="28" fill="#2d251d" font-family="Georgia, serif">${text(args.output.subtitle, 58)}</text>
        <text x="800" y="835" text-anchor="middle" font-size="17" font-weight="800" fill="#2c6b78" font-family="system-ui, sans-serif">Made for ${text(args.recipientName, 24)} - ${text(args.occasion, 18)}</text>
        <text x="800" y="876" text-anchor="middle" font-size="15" fill="#554637" font-family="system-ui, sans-serif">${text(args.output.themeSummary, 74)}</text>
      </g>
      <g transform="translate(385 450) rotate(-15)" filter="url(#softShadow)">
        <rect x="-120" y="-72" width="240" height="144" rx="15" fill="#2f78a0" stroke="#fff8e8" stroke-width="8" />
        <text x="0" y="8" text-anchor="middle" font-size="21" font-weight="900" fill="#fff8e8" font-family="system-ui, sans-serif">DETOUR</text>
      </g>
      <g transform="translate(1140 1035) rotate(-17)" filter="url(#softShadow)">
        <rect x="-130" y="-78" width="260" height="156" rx="15" fill="#c3762f" stroke="#fff8e8" stroke-width="8" />
        <text x="0" y="8" text-anchor="middle" font-size="18" font-weight="900" fill="#fff8e8" font-family="system-ui, sans-serif">LOCAL LEGEND</text>
      </g>
      ${tiles}
      <rect width="1600" height="1600" filter="url(#paperNoise)" opacity="0.55" />
    </svg>
  `.trim();
}

function portrait(x: number, y: number, w: number, h: number, index: number, name: string, detail: string) {
  const color = FACE_COLORS[index % FACE_COLORS.length];
  const skin = ["#d2a176", "#8e5937", "#e1ba8d", "#b77a55", "#f0c89b"][index % 5];
  const hair = ["#2c1c13", "#6d3a1d", "#151515", "#b57132", "#4a2e21"][index % 5];

  return `
    <g filter="url(#hardShadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${color}" stroke="#d1a55f" stroke-width="3" />
      <rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" rx="5" fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.18)" />
      <circle cx="${x + 54}" cy="${y + 62}" r="28" fill="${skin}" />
      <path d="M ${x + 24} ${y + 57} C ${x + 30} ${y + 22}, ${x + 82} ${y + 20}, ${x + 86} ${y + 58} C ${x + 64} ${y + 44}, ${x + 43} ${y + 45}, ${x + 24} ${y + 57} Z" fill="${hair}" />
      <path d="M ${x + 20} ${y + 125} C ${x + 34} ${y + 92}, ${x + 78} ${y + 92}, ${x + 96} ${y + 125} Z" fill="#111" opacity="0.66" />
      <text x="${x + 108}" y="${y + 58}" font-size="18" font-weight="900" fill="#fff8e8" font-family="system-ui, sans-serif">${text(name.toUpperCase(), 16)}</text>
      <text x="${x + 108}" y="${y + 88}" font-size="13" font-weight="800" fill="#fff8e8" font-family="system-ui, sans-serif">${text(detail, 30)}</text>
      <text x="${x + 108}" y="${y + 112}" font-size="12" fill="#fff8e8" font-family="system-ui, sans-serif">Always has an alibi.</text>
    </g>
  `;
}

function evidence(x: number, y: number, index: number, label: string) {
  const icon =
    index % 4 === 0
      ? `<circle cx="${x + 80}" cy="${y + 82}" r="30" fill="#0d0d0d" /><rect x="${x + 100}" y="${y + 102}" width="56" height="14" rx="7" fill="#0d0d0d" transform="rotate(40 ${x + 100} ${y + 102})" />`
      : index % 4 === 1
        ? `<rect x="${x + 48}" y="${y + 45}" width="72" height="88" rx="8" fill="#ccb17a" /><path d="M ${x + 63} ${y + 72} H ${x + 105} M ${x + 63} ${y + 96} H ${x + 105} M ${x + 63} ${y + 120} H ${x + 96}" stroke="#23180f" stroke-width="5" />`
        : index % 4 === 2
          ? `<path d="M ${x + 38} ${y + 118} C ${x + 68} ${y + 42}, ${x + 120} ${y + 42}, ${x + 150} ${y + 118}" fill="none" stroke="#d1a55f" stroke-width="14" /><circle cx="${x + 94}" cy="${y + 94}" r="18" fill="#d1a55f" />`
          : `<rect x="${x + 47}" y="${y + 56}" width="94" height="58" rx="8" fill="#18252e" /><circle cx="${x + 94}" cy="${y + 85}" r="22" fill="#394b5c" stroke="#d1a55f" stroke-width="5" />`;

  return `
    <g filter="url(#hardShadow)">
      <rect x="${x}" y="${y}" width="178" height="176" rx="8" fill="#171b19" stroke="#d1a55f" stroke-width="3" />
      <text x="${x + 89}" y="${y + 31}" text-anchor="middle" font-size="14" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">EVIDENCE</text>
      ${icon}
      <text x="${x + 89}" y="${y + 151}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff8e8" font-family="system-ui, sans-serif">${text(label.toUpperCase(), 17)}</text>
    </g>
  `;
}

function room(x: number, y: number, w: number, h: number, name: string, index: number) {
  const floor = ["#5b3722", "#76502a", "#3f5146", "#5c4636", "#624030"][index % 5];

  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${floor}" stroke="#f1dfbd" stroke-width="8" />
      <rect x="${x + 24}" y="${y + 28}" width="${w - 48}" height="${h - 58}" fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.12)" />
      <path d="M ${x + 26} ${y + 34} H ${x + w - 28} M ${x + 26} ${y + h - 34} H ${x + w - 28}" stroke="rgba(255,255,255,0.15)" stroke-width="3" />
      <rect x="${x + w * 0.3}" y="${y + h * 0.28}" width="${w * 0.4}" height="${h * 0.36}" rx="10" fill="rgba(17,10,7,0.3)" stroke="rgba(255,245,215,0.16)" />
      <circle cx="${x + w * 0.18}" cy="${y + h * 0.78}" r="18" fill="#d1a55f" opacity="0.58" />
      <rect x="${x + w / 2 - 86}" y="${y + h / 2 - 20}" width="172" height="40" rx="5" fill="#101413" stroke="#d1a55f" stroke-width="2.4" />
      <text x="${x + w / 2}" y="${y + h / 2 + 8}" text-anchor="middle" font-size="17" font-weight="900" fill="#fff8e8" font-family="system-ui, sans-serif">${text(name.toUpperCase(), 17)}</text>
    </g>
  `;
}

function showcaseCaseFile(args: ShowcaseArgs) {
  const suspects = args.output.deckSecondary.slice(0, 8);
  const evidenceCards = args.output.deckPrimary.slice(0, 5);
  const roomNames = args.output.tiles.map((tile) => tile.name);

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text(args.output.title, 80)}">
      ${defs(6)}
      <rect width="1600" height="1600" fill="#070c0d" />
      <rect x="16" y="16" width="1568" height="1568" rx="16" fill="url(#darkFelt)" stroke="#b58d55" stroke-width="3" />
      <rect width="1600" height="1600" filter="url(#paperNoise)" />
      <g>
        <rect x="30" y="30" width="232" height="1035" rx="8" fill="#101717" stroke="#b58d55" stroke-width="3" />
        <text x="146" y="92" text-anchor="middle" font-size="30" font-weight="900" fill="#f8ead0" font-family="Georgia, serif">${text(args.recipientName.toUpperCase(), 12)}</text>
        <text x="146" y="135" text-anchor="middle" font-size="34" font-weight="900" fill="#f8ead0" font-family="Georgia, serif">CASE FILE</text>
        <g transform="translate(54 215) rotate(-4)" filter="url(#softShadow)">
          <rect width="172" height="320" rx="8" fill="#c3a06d" stroke="#2a2017" stroke-width="3" />
          <text x="28" y="58" font-size="24" font-weight="900" fill="#261d14" font-family="Georgia, serif">THE CASE</text>
          <text x="28" y="112" font-size="17" font-weight="900" fill="#261d14" font-family="system-ui, sans-serif">Who?</text>
          <text x="28" y="168" font-size="17" font-weight="900" fill="#261d14" font-family="system-ui, sans-serif">What?</text>
          <text x="28" y="224" font-size="17" font-weight="900" fill="#261d14" font-family="system-ui, sans-serif">Where?</text>
          <path d="M 28 130 H 144 M 28 186 H 144 M 28 242 H 144" stroke="#5c4026" stroke-width="2" />
          <rect x="50" y="265" width="94" height="32" fill="none" stroke="#8b241b" stroke-width="3" transform="rotate(-6 97 281)" />
          <text x="97" y="288" text-anchor="middle" font-size="16" font-weight="900" fill="#8b241b" font-family="system-ui, sans-serif" transform="rotate(-6 97 281)">PRIVATE</text>
        </g>
        <rect x="42" y="1128" width="204" height="260" rx="8" fill="#101717" stroke="#b58d55" stroke-width="3" />
        <text x="144" y="1192" text-anchor="middle" font-size="18" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">MAKE A THEORY</text>
        <text x="72" y="1242" font-size="18" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">WHO?</text>
        <text x="72" y="1306" font-size="18" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">WHERE?</text>
        <path d="M 72 1266 H 214 M 72 1330 H 214" stroke="#55483a" stroke-width="3" />
      </g>
      ${suspects
        .slice(0, 5)
        .map((card, index) =>
          portrait(284 + index * 210, 34, 196, 164, index, card.title.replace(/^Twist:\s*/i, ""), card.body),
        )
        .join("")}
      ${evidenceCards
        .slice(0, 4)
        .map((card, index) =>
          evidence(1386, 214 + index * 204, index, card.title.replace(/^Evidence:\s*/i, "")),
        )
        .join("")}
      <g filter="url(#softShadow)">
        <rect x="310" y="224" width="1028" height="1042" rx="12" fill="#18211b" stroke="#b58d55" stroke-width="4" />
        <rect x="354" y="274" width="940" height="930" fill="#473a2d" stroke="#f0dfbd" stroke-width="7" />
        <path d="M 410 747 H 1210 M 800 302 V 1170" stroke="#e7d2ac" stroke-width="18" opacity="0.5" />
        ${room(382, 308, 280, 212, roomNames[0] ?? "Studio", 0)}
        ${room(692, 308, 280, 212, roomNames[1] ?? "Library", 1)}
        ${room(1002, 308, 238, 212, roomNames[2] ?? "Gym", 2)}
        ${room(382, 840, 300, 260, roomNames[3] ?? "Music Room", 3)}
        ${room(702, 850, 210, 250, roomNames[4] ?? "Kitchen", 4)}
        ${room(942, 830, 300, 270, roomNames[5] ?? "Office", 5)}
        <rect x="516" y="556" width="590" height="245" fill="#75614b" stroke="#f0dfbd" stroke-width="8" />
        <rect x="708" y="642" width="226" height="58" rx="7" fill="#111412" stroke="#d1a55f" stroke-width="2.5" />
        <text x="821" y="680" text-anchor="middle" font-size="24" font-weight="900" fill="#fff8e8" font-family="system-ui, sans-serif">THE FOYER</text>
        <text x="821" y="760" text-anchor="middle" font-size="16" font-weight="800" fill="#f8ead0" font-family="system-ui, sans-serif">${text(args.output.centerKicker ?? args.output.themeSummary, 60)}</text>
      </g>
      ${suspects
        .slice(5, 8)
        .map((card, index) =>
          portrait(308 + index * 326, 1352, 300, 184, index + 5, card.title.replace(/^Twist:\s*/i, ""), card.body),
        )
        .join("")}
      <rect x="1040" y="1352" width="300" height="184" rx="8" fill="#23495b" stroke="#d1a55f" stroke-width="3" />
      <text x="1190" y="1420" text-anchor="middle" font-size="23" font-weight="900" fill="#fff8e8" font-family="Georgia, serif">${text(args.output.title.toUpperCase(), 17)}</text>
      <text x="1190" y="1466" text-anchor="middle" font-size="15" fill="#fff8e8" font-family="system-ui, sans-serif">${text(args.output.subtitle, 38)}</text>
    </svg>
  `.trim();
}

function showcaseFaceCard(args: ShowcaseArgs) {
  const cards = Array.from({ length: 24 }, (_, index) => {
    const tile = args.output.tiles[index % args.output.tiles.length];
    const col = index % 6;
    const row = Math.floor(index / 6);
    return faceGridCard(226 + col * 204, 304 + row * 235, index, tile.name, tile.caption);
  }).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text(args.output.title, 80)}">
      ${defs(9)}
      <rect width="1600" height="1600" fill="#122b35" />
      <rect x="42" y="42" width="1516" height="1516" rx="36" fill="#dceff1" stroke="#101010" stroke-width="7" />
      <rect width="1600" height="1600" filter="url(#paperNoise)" opacity="0.45" />
      <text x="800" y="128" text-anchor="middle" font-size="74" font-weight="900" fill="#111" font-family="Georgia, serif">${text(args.output.title.toUpperCase(), 32)}</text>
      <text x="800" y="178" text-anchor="middle" font-size="23" font-weight="800" fill="#c94f2f" font-family="system-ui, sans-serif">${text(args.output.subtitle, 70)}</text>
      <g filter="url(#softShadow)">
        <rect x="190" y="270" width="1240" height="1018" rx="34" fill="rgba(255,255,255,0.64)" stroke="#141414" stroke-width="4" />
        ${cards}
      </g>
      <rect x="58" y="312" width="118" height="740" rx="20" fill="#101a1f" stroke="#d0a24f" stroke-width="4" />
      ${args.output.boardSections
        .slice(0, 4)
        .map(
          (section, index) => `
            <g transform="translate(117 ${410 + index * 150})">
              <circle cx="0" cy="-28" r="29" fill="${FACE_COLORS[index]}" />
              <text x="0" y="30" text-anchor="middle" font-size="11" font-weight="900" fill="#fff5d8" font-family="system-ui, sans-serif">${text(section.label.toUpperCase(), 10)}</text>
            </g>
          `,
        )
        .join("")}
      ${deck(300, 1370, -6, args.output.deckPrimaryLabel, "#244c62")}
      ${deck(1090, 1370, 7, args.output.deckSecondaryLabel, "#8a4e35")}
      <rect x="546" y="1328" width="510" height="152" rx="24" fill="#fffaf0" stroke="#111" stroke-width="4" filter="url(#softShadow)" />
      <text x="801" y="1390" text-anchor="middle" font-size="24" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${text(args.output.centerKicker ?? args.output.themeSummary, 44)}</text>
      <text x="801" y="1435" text-anchor="middle" font-size="15" fill="#4a3f36" font-family="system-ui, sans-serif">Cover faces with included markers as clues narrow the field.</text>
    </svg>
  `.trim();
}

function faceGridCard(x: number, y: number, index: number, name: string, caption: string) {
  const color = FACE_COLORS[index % FACE_COLORS.length];
  const skin = ["#d4a06f", "#905c39", "#efc190", "#b87954", "#f2cca3"][index % 5];
  const hair = ["#2b1c12", "#6c3a1d", "#111", "#b87935", "#4a2c20"][index % 5];

  return `
    <g>
      <rect x="${x}" y="${y}" width="178" height="208" rx="18" fill="#fffaf0" stroke="#111" stroke-width="4" />
      <rect x="${x + 13}" y="${y + 13}" width="152" height="125" rx="14" fill="${color}" opacity="0.92" />
      <circle cx="${x + 89}" cy="${y + 67}" r="31" fill="${skin}" />
      <path d="M ${x + 56} ${y + 61} C ${x + 60} ${y + 26}, ${x + 118} ${y + 27}, ${x + 122} ${y + 61} C ${x + 103} ${y + 48}, ${x + 76} ${y + 48}, ${x + 56} ${y + 61} Z" fill="${hair}" />
      <path d="M ${x + 48} ${y + 138} C ${x + 58} ${y + 103}, ${x + 120} ${y + 103}, ${x + 133} ${y + 138} Z" fill="#101820" opacity="0.7" />
      <circle cx="${x + 79}" cy="${y + 70}" r="3" fill="#111" />
      <circle cx="${x + 100}" cy="${y + 70}" r="3" fill="#111" />
      <path d="M ${x + 77} ${y + 89} C ${x + 86} ${y + 96}, ${x + 96} ${y + 96}, ${x + 104} ${y + 89}" fill="none" stroke="#6c412c" stroke-width="3" stroke-linecap="round" />
      <text x="${x + 89}" y="${y + 166}" text-anchor="middle" font-size="15" font-weight="900" fill="#181818" font-family="system-ui, sans-serif">${text(name.toUpperCase(), 16)}</text>
      <text x="${x + 89}" y="${y + 190}" text-anchor="middle" font-size="9.5" fill="#4a3f36" font-family="system-ui, sans-serif">${text(caption, 24)}</text>
    </g>
  `;
}

function deck(x: number, y: number, rotate: number, label: string, color: string) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#softShadow)">
      <rect x="-112" y="-70" width="224" height="140" rx="16" fill="${color}" stroke="#fff5d8" stroke-width="8" />
      <text x="0" y="8" text-anchor="middle" font-size="20" font-weight="900" fill="#fff5d8" font-family="system-ui, sans-serif">${text(label.toUpperCase(), 17)}</text>
    </g>
  `;
}

function showcaseTrivia(args: ShowcaseArgs) {
  const spaces = Array.from({ length: 32 }, (_, index) => {
    const angle = (index / 32) * Math.PI * 2 - Math.PI / 2;
    const x = 800 + Math.cos(angle) * 570;
    const y = 812 + Math.sin(angle) * 570;
    const tile = args.output.tiles[index % args.output.tiles.length];
    return `
      <g transform="translate(${x} ${y}) rotate(${(index / 32) * 360})">
        <rect x="-72" y="-38" width="144" height="76" rx="18" fill="#fffdf4" stroke="#111" stroke-width="3" />
        <rect x="-72" y="-38" width="144" height="16" rx="8" fill="${FACE_COLORS[index % FACE_COLORS.length]}" />
        <text x="0" y="-1" text-anchor="middle" font-size="13" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${text(tile.name.toUpperCase(), 15)}</text>
        <text x="0" y="22" text-anchor="middle" font-size="9.5" fill="#41382f" font-family="system-ui, sans-serif">${text(tile.caption, 23)}</text>
      </g>
    `;
  }).join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text(args.output.title, 80)}">
      ${defs(12)}
      <rect width="1600" height="1600" fill="#263d3f" />
      <rect x="42" y="42" width="1516" height="1516" rx="34" fill="url(#linen)" stroke="#111" stroke-width="7" />
      <rect width="1600" height="1600" filter="url(#paperNoise)" opacity="0.5" />
      <text x="800" y="128" text-anchor="middle" font-size="74" font-weight="900" fill="#171717" font-family="Georgia, serif">${text(args.output.title.toUpperCase(), 32)}</text>
      <text x="800" y="178" text-anchor="middle" font-size="23" font-weight="800" fill="#2f7d65" font-family="system-ui, sans-serif">${text(args.output.subtitle, 76)}</text>
      <g filter="url(#softShadow)">
        <circle cx="800" cy="812" r="640" fill="rgba(255,255,255,0.42)" stroke="#111" stroke-width="4" />
        <circle cx="800" cy="812" r="405" fill="#fffdf4" stroke="#111" stroke-width="4" />
        ${[0, 1, 2, 3, 4, 5]
          .map((i) => {
            const start = i * 60 - 90;
            const end = start + 60;
            const a1 = (start * Math.PI) / 180;
            const a2 = (end * Math.PI) / 180;
            const p1 = [800 + Math.cos(a1) * 355, 812 + Math.sin(a1) * 355];
            const p2 = [800 + Math.cos(a2) * 355, 812 + Math.sin(a2) * 355];
            const p3 = [800 + Math.cos(a2) * 124, 812 + Math.sin(a2) * 124];
            const p4 = [800 + Math.cos(a1) * 124, 812 + Math.sin(a1) * 124];
            const label = args.output.boardSections[i % args.output.boardSections.length]?.label ?? "Round";
            const tx = 800 + Math.cos(((start + 30) * Math.PI) / 180) * 245;
            const ty = 812 + Math.sin(((start + 30) * Math.PI) / 180) * 245;
            return `<path d="M ${p1[0]} ${p1[1]} A 355 355 0 0 1 ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} A 124 124 0 0 0 ${p4[0]} ${p4[1]} Z" fill="${FACE_COLORS[i]}" stroke="#fff8e8" stroke-width="5" /><text x="${tx}" y="${ty}" text-anchor="middle" font-size="17" font-weight="900" fill="#fffdf4" font-family="system-ui, sans-serif">${text(label.toUpperCase(), 15)}</text>`;
          })
          .join("")}
        <circle cx="800" cy="812" r="130" fill="#fffdf4" stroke="#111" stroke-width="5" />
        <text x="800" y="794" text-anchor="middle" font-size="25" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${text(args.recipientName.toUpperCase(), 12)}</text>
        <text x="800" y="836" text-anchor="middle" font-size="52" font-weight="900" fill="#b44d35" font-family="Georgia, serif">FINAL</text>
        <text x="800" y="870" text-anchor="middle" font-size="18" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">QUESTION</text>
        ${spaces}
      </g>
      ${deck(310, 310, -12, args.output.deckPrimaryLabel, "#2f7d8a")}
      ${deck(1290, 315, 11, args.output.deckSecondaryLabel, "#d66138")}
      ${deck(320, 1302, 10, "Speed Round", "#76549c")}
      ${deck(1280, 1298, -8, "Bonus Round", "#d5a23f")}
      <rect x="548" y="1312" width="504" height="128" rx="24" fill="#fffdf4" stroke="#111" stroke-width="4" filter="url(#softShadow)" />
      <text x="800" y="1366" text-anchor="middle" font-size="22" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${text(args.output.centerKicker ?? args.output.themeSummary, 48)}</text>
      <text x="800" y="1406" text-anchor="middle" font-size="15" fill="#4b4036" font-family="system-ui, sans-serif">Roll, answer, score, and race to the final question.</text>
    </svg>
  `.trim();
}

function showcaseMilestone(args: ShowcaseArgs) {
  const points = Array.from({ length: 32 }, (_, index) => {
    const row = Math.floor(index / 8);
    const colRaw = index % 8;
    const col = row % 2 === 0 ? colRaw : 7 - colRaw;
    return { x: 245 + col * 160, y: [300, 528, 1080, 1304][row] + Math.sin(index * 0.7) * 22 };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const spaces = points
    .map((point, index) => {
      const tile = args.output.tiles[index % args.output.tiles.length];
      const color = TILE_BANDS[index % TILE_BANDS.length];
      return `
        <g transform="translate(${point.x} ${point.y}) rotate(${index % 2 === 0 ? -3 : 3})" filter="url(#hardShadow)">
          <rect x="-70" y="-42" width="140" height="84" rx="20" fill="#fff9e8" stroke="#111" stroke-width="3" />
          <rect x="-70" y="-42" width="140" height="15" rx="8" fill="${color}" />
          <text x="0" y="-4" text-anchor="middle" font-size="14" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">${text(tile.name.toUpperCase(), 16)}</text>
          <text x="0" y="20" text-anchor="middle" font-size="9.8" fill="#43382e" font-family="system-ui, sans-serif">${text(tile.caption, 23)}</text>
        </g>
      `;
    })
    .join("");

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text(args.output.title, 80)}">
      ${defs(15)}
      <rect width="1600" height="1600" fill="#20343b" />
      <rect x="42" y="42" width="1516" height="1516" rx="36" fill="url(#linen)" stroke="#171717" stroke-width="7" />
      <rect width="1600" height="1600" filter="url(#paperNoise)" opacity="0.5" />
      ${miniLandscape(210, 638, 310, 252, 1)}
      ${miniLandscape(1080, 638, 310, 252, 0)}
      ${miniLandscape(212, 884, 300, 176, 3)}
      ${miniLandscape(1088, 884, 298, 176, 2)}
      <g filter="url(#softShadow)">
        <path d="${path}" fill="none" stroke="#26221d" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" opacity="0.2" />
        <path d="${path}" fill="none" stroke="#c46b38" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${path}" fill="none" stroke="#fff7e4" stroke-width="5" stroke-dasharray="20 20" stroke-linecap="round" stroke-linejoin="round" />
        ${spaces}
      </g>
      <g filter="url(#softShadow)">
        <rect x="488" y="650" width="624" height="332" rx="30" fill="#fffaf0" stroke="#171717" stroke-width="5" />
        <rect x="532" y="700" width="536" height="76" fill="#a84831" stroke="#171717" stroke-width="3" />
        <text x="800" y="753" text-anchor="middle" font-size="34" font-weight="900" fill="#fff7e4" font-family="Georgia, serif">${text(args.output.title.toUpperCase(), 28)}</text>
        <text x="800" y="817" text-anchor="middle" font-size="23" font-weight="800" fill="#2c6b78" font-family="system-ui, sans-serif">${text(args.output.subtitle, 62)}</text>
        <text x="800" y="862" text-anchor="middle" font-size="18" fill="#4b3e34" font-family="system-ui, sans-serif">Made for ${text(args.recipientName, 22)} - ${text(args.occasion, 18)}</text>
        <text x="800" y="910" text-anchor="middle" font-size="16" fill="#4b3e34" font-family="system-ui, sans-serif">${text(args.output.themeSummary, 72)}</text>
      </g>
      <g transform="translate(1240 455)" filter="url(#softShadow)">
        <circle r="96" fill="#fffaf0" stroke="#171717" stroke-width="5" />
        <path d="M 0 -78 L 24 -8 L 76 0 L 24 8 Z" fill="#c46b38" />
        <text x="0" y="126" text-anchor="middle" font-size="18" font-weight="900" fill="#171717" font-family="system-ui, sans-serif">SPINNER</text>
      </g>
      ${deck(360, 452, -8, args.output.deckPrimaryLabel, "#244d61")}
    </svg>
  `.trim();
}

export function renderTemplateShowcaseSvg(args: ShowcaseArgs) {
  switch (args.slug) {
    case "home-turf":
      return showcaseHomeTurf(args);
    case "case-file":
      return showcaseCaseFile(args);
    case "face-card":
      return showcaseFaceCard(args);
    case "trivia-trek":
      return showcaseTrivia(args);
    case "milestone-trail":
    default:
      return showcaseMilestone(args);
  }
}
