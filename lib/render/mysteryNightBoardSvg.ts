import type { BoardRenderArgs } from "@/lib/templates/types";
import { escapeXml } from "@/lib/utils";

import {
  buildBleedGuides,
  PALETTES,
  truncateBoardText,
} from "@/lib/render/sharedBoard";

const CARD_COLORS = ["#344b34", "#57364f", "#23495b", "#6a4a24", "#51352d", "#2f415d"];

function personNameFromCard(title: string) {
  return title.replace(/^Twist:\s*/i, "").replace(/^Reveal:\s*/i, "");
}

function portraitCard({
  x,
  y,
  w,
  h,
  index,
  name,
  note,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  index: number;
  name: string;
  note: string;
}) {
  const color = CARD_COLORS[index % CARD_COLORS.length];

  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" stroke="#cda968" stroke-width="3" />
      <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="3" fill="rgba(0,0,0,0.14)" stroke="rgba(255,255,255,0.18)" />
      <circle cx="${x + 52}" cy="${y + 62}" r="28" fill="#d7b38a" />
      <path d="M ${x + 24} ${y + 126} C ${x + 34} ${y + 84}, ${x + 72} ${y + 84}, ${x + 86} ${y + 126} Z" fill="#1b1714" opacity="0.7" />
      <text x="${x + w - 14}" y="${y + 32}" text-anchor="end" font-size="13" font-weight="900" fill="#f7e8c8" font-family="system-ui, sans-serif">SUSPECT</text>
      <text x="${x + 104}" y="${y + 70}" font-size="20" font-weight="900" fill="#fff8e7" font-family="Georgia, serif">${escapeXml(truncateBoardText(name, 18).toUpperCase())}</text>
      <text x="${x + 104}" y="${y + 100}" font-size="13" font-weight="700" fill="#f7e8c8" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(note, 31))}</text>
      <text x="${x + 104}" y="${y + 121}" font-size="13" fill="#f7e8c8" font-family="system-ui, sans-serif">Suspiciously familiar</text>
    </g>
  `;
}

function evidenceCard({
  x,
  y,
  index,
  title,
}: {
  x: number;
  y: number;
  index: number;
  title: string;
}) {
  const icons = [
    `<circle cx="${x + 78}" cy="${y + 82}" r="28" fill="#222" /><rect x="${x + 98}" y="${y + 102}" width="54" height="13" rx="6" fill="#222" transform="rotate(40 ${x + 98} ${y + 102})" />`,
    `<rect x="${x + 48}" y="${y + 48}" width="72" height="88" rx="8" fill="#d7c08f" /><path d="M ${x + 64} ${y + 72} H ${x + 106} M ${x + 64} ${y + 92} H ${x + 106} M ${x + 64} ${y + 112} H ${x + 96}" stroke="#2c2118" stroke-width="5" />`,
    `<path d="M ${x + 38} ${y + 118} C ${x + 68} ${y + 44}, ${x + 118} ${y + 44}, ${x + 148} ${y + 118}" fill="none" stroke="#cda968" stroke-width="14" /><circle cx="${x + 92}" cy="${y + 94}" r="18" fill="#cda968" />`,
    `<rect x="${x + 46}" y="${y + 58}" width="92" height="54" rx="8" fill="#1d2730" /><circle cx="${x + 92}" cy="${y + 85}" r="21" fill="#394b5c" stroke="#cda968" stroke-width="5" />`,
  ];

  return `
    <g>
      <rect x="${x}" y="${y}" width="178" height="176" rx="8" fill="#171c1a" stroke="#cda968" stroke-width="3" />
      <text x="${x + 89}" y="${y + 32}" text-anchor="middle" font-size="15" font-weight="900" fill="#f7e8c8" font-family="system-ui, sans-serif">EVIDENCE</text>
      ${icons[index % icons.length]}
      <text x="${x + 89}" y="${y + 150}" text-anchor="middle" font-size="15" font-weight="900" fill="#fff8e7" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(title, 18).toUpperCase())}</text>
    </g>
  `;
}

function room({
  x,
  y,
  w,
  h,
  name,
  index,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  index: number;
}) {
  const wood = ["#5b3520", "#70431f", "#3a4b41", "#5a4939"][index % 4];

  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wood}" stroke="#f2e5c9" stroke-width="8" />
      <path d="M ${x + 20} ${y + 28} H ${x + w - 20} M ${x + 20} ${y + h - 28} H ${x + w - 20}" stroke="rgba(255,255,255,0.14)" stroke-width="3" />
      <rect x="${x + w * 0.24}" y="${y + h * 0.25}" width="${w * 0.52}" height="${h * 0.42}" rx="12" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.18)" />
      <circle cx="${x + w * 0.18}" cy="${y + h * 0.78}" r="20" fill="#d1ad74" opacity="0.5" />
      <rect x="${x + w / 2 - 96}" y="${y + h / 2 - 22}" width="192" height="44" rx="6" fill="#111412" stroke="#cda968" stroke-width="2.5" />
      <text x="${x + w / 2}" y="${y + h / 2 + 8}" text-anchor="middle" font-size="19" font-weight="900" fill="#fff8e7" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(name, 18).toUpperCase())}</text>
    </g>
  `;
}

export function renderMysteryNightBoardSvg({
  output,
  project,
  mode = "preview",
  backgroundArtDataUrl,
}: BoardRenderArgs) {
  const palette = PALETTES[project.colorMood as keyof typeof PALETTES] ?? PALETTES.muted;
  const suspects = output.deckSecondary.slice(0, 8);
  const evidence = output.deckPrimary.slice(0, 5);
  const roomNames = output.tiles.map((tile) => tile.name);

  return `
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(output.title)}">
      <defs>
        <radialGradient id="caseGlow" cx="52%" cy="48%" r="62%">
          <stop offset="0%" stop-color="#594126" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#090d0d" stop-opacity="1" />
        </radialGradient>
        <filter id="caseShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="0.45" />
        </filter>
      </defs>

      <rect width="1600" height="1600" fill="#080d0e" />
      <rect x="18" y="18" width="1564" height="1564" rx="18" fill="url(#caseGlow)" stroke="#b48a51" stroke-width="3" />
      ${buildBleedGuides(mode)}
      ${
        backgroundArtDataUrl
          ? `<image href="${backgroundArtDataUrl}" x="260" y="220" width="1060" height="1100" preserveAspectRatio="xMidYMid slice" opacity="0.38" />`
          : ""
      }

      <g filter="url(#caseShadow)">
        <rect x="30" y="30" width="232" height="1010" rx="8" fill="#101717" stroke="#b48a51" stroke-width="3" />
        <text x="146" y="102" text-anchor="middle" font-size="28" font-weight="900" fill="#f8ead0" font-family="Georgia, serif">${escapeXml(truncateBoardText(project.recipientName, 12).toUpperCase())}</text>
        <text x="146" y="142" text-anchor="middle" font-size="30" font-weight="900" fill="#f8ead0" font-family="Georgia, serif">CASE FILE</text>
        <text x="146" y="176" text-anchor="middle" font-size="15" fill="#f8ead0" font-family="system-ui, sans-serif">Personalized mystery board</text>
        <g transform="translate(54 222) rotate(-4)">
          <rect x="0" y="0" width="170" height="305" rx="8" fill="#c6a26b" stroke="#2a2017" stroke-width="3" />
          <text x="28" y="58" font-size="26" font-weight="900" fill="#261d14" font-family="Georgia, serif">THE CASE FILE</text>
          <text x="28" y="112" font-size="17" font-weight="900" fill="#261d14" font-family="system-ui, sans-serif">Who?</text>
          <path d="M 28 128 H 144 M 28 180 H 144 M 28 232 H 144" stroke="#5c4026" stroke-width="2" />
          <text x="28" y="164" font-size="17" font-weight="900" fill="#261d14" font-family="system-ui, sans-serif">What?</text>
          <text x="28" y="216" font-size="17" font-weight="900" fill="#261d14" font-family="system-ui, sans-serif">Where?</text>
          <rect x="48" y="250" width="94" height="32" fill="none" stroke="#8b241b" stroke-width="3" transform="rotate(-6 95 266)" />
          <text x="95" y="273" text-anchor="middle" font-size="18" font-weight="900" fill="#8b241b" font-family="system-ui, sans-serif" transform="rotate(-6 95 266)">PRIVATE</text>
        </g>
        <rect x="42" y="1120" width="204" height="260" rx="8" fill="#101717" stroke="#b48a51" stroke-width="3" />
        <text x="144" y="1184" text-anchor="middle" font-size="19" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">MAKE A THEORY</text>
        <text x="72" y="1240" font-size="19" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">WHO?</text>
        <path d="M 72 1265 H 214 M 72 1328 H 214" stroke="#55483a" stroke-width="3" />
        <text x="72" y="1303" font-size="19" font-weight="900" fill="#f8ead0" font-family="system-ui, sans-serif">WHERE?</text>
      </g>

      ${suspects
        .slice(0, 5)
        .map((card, index) =>
          portraitCard({
            x: 280 + index * 206,
            y: 32,
            w: 192,
            h: 166,
            index,
            name: personNameFromCard(card.title),
            note: card.body,
          }),
        )
        .join("")}

      ${evidence
        .slice(0, 4)
        .map((card, index) =>
          evidenceCard({
            x: 1388,
            y: 212 + index * 202,
            index,
            title: card.title.replace(/^Evidence:\s*/i, ""),
          }),
        )
        .join("")}

      <g filter="url(#caseShadow)">
        <rect x="304" y="224" width="1034" height="1040" rx="12" fill="#18211b" stroke="#b48a51" stroke-width="4" />
        <rect x="352" y="272" width="938" height="928" fill="#44382c" stroke="#f0dfbd" stroke-width="7" />
        <path d="M 410 745 H 1210 M 800 300 V 1170" stroke="#e7d2ac" stroke-width="18" opacity="0.52" />
        ${room({ x: 380, y: 306, w: 280, h: 212, name: roomNames[0] ?? "Studio", index: 0 })}
        ${room({ x: 690, y: 306, w: 280, h: 212, name: roomNames[1] ?? "Library", index: 1 })}
        ${room({ x: 1000, y: 306, w: 238, h: 212, name: roomNames[2] ?? "Gym", index: 2 })}
        ${room({ x: 380, y: 840, w: 300, h: 260, name: roomNames[3] ?? "Music Room", index: 3 })}
        ${room({ x: 700, y: 850, w: 210, h: 250, name: roomNames[4] ?? "Kitchen", index: 4 })}
        ${room({ x: 940, y: 830, w: 300, h: 270, name: roomNames[5] ?? "Office", index: 5 })}
        <rect x="515" y="555" width="590" height="245" fill="#78654d" stroke="#f0dfbd" stroke-width="8" />
        <rect x="707" y="642" width="226" height="58" rx="7" fill="#111412" stroke="#cda968" stroke-width="2.5" />
        <text x="820" y="680" text-anchor="middle" font-size="24" font-weight="900" fill="#fff8e7" font-family="system-ui, sans-serif">THE FOYER</text>
        <text x="820" y="760" text-anchor="middle" font-size="17" font-weight="800" fill="#f8ead0" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.centerKicker ?? output.themeSummary, 62))}</text>
      </g>

      ${suspects
        .slice(5, 8)
        .map((card, index) =>
          portraitCard({
            x: 306 + index * 325,
            y: 1352,
            w: 300,
            h: 184,
            index: index + 5,
            name: personNameFromCard(card.title),
            note: card.body,
          }),
        )
        .join("")}

      <rect x="1042" y="1352" width="296" height="184" rx="6" fill="${palette.accentTwo}" stroke="#cda968" stroke-width="3" />
      <text x="1190" y="1425" text-anchor="middle" font-size="25" font-weight="900" fill="#fff8e7" font-family="Georgia, serif">${escapeXml(truncateBoardText(project.recipientName, 18).toUpperCase())}</text>
      <text x="1190" y="1470" text-anchor="middle" font-size="17" fill="#fff8e7" font-family="system-ui, sans-serif">${escapeXml(truncateBoardText(output.subtitle, 44))}</text>
    </svg>
  `.trim();
}
