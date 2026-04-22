export const PALETTES = {
  warm: {
    bg: "#fcf6eb",
    accent: "#d97757",
    accentTwo: "#2f5d62",
    tile: "#fff7ef",
    line: "#5e4b43",
    highlight: "#f4b183",
  },
  bright: {
    bg: "#f3fbff",
    accent: "#0f766e",
    accentTwo: "#f97316",
    tile: "#ffffff",
    line: "#164e63",
    highlight: "#7dd3fc",
  },
  muted: {
    bg: "#f5f1eb",
    accent: "#6b7280",
    accentTwo: "#8b5e3c",
    tile: "#fcfbf8",
    line: "#433b36",
    highlight: "#d8cab8",
  },
  bold: {
    bg: "#fff6ec",
    accent: "#7c2d12",
    accentTwo: "#14532d",
    tile: "#fffdf8",
    line: "#2d1b12",
    highlight: "#fdba74",
  },
  neutral: {
    bg: "#fbfaf7",
    accent: "#374151",
    accentTwo: "#b45309",
    tile: "#ffffff",
    line: "#312e2b",
    highlight: "#e7ddcf",
  },
} as const;

export function buildLoopPoint(index: number, total: number, xBias = 0, yBias = 0) {
  const t = (index / total) * Math.PI * 2;
  const radiusX = 480 + Math.sin(t * 2.2) * 60 + xBias;
  const radiusY = 390 + Math.cos(t * 1.6) * 75 + yBias;
  const x = 800 + Math.cos(t) * radiusX;
  const y = 800 + Math.sin(t) * radiusY + Math.sin(t * 3.5) * 48;

  return { x, y, angle: (t * 180) / Math.PI + 90 };
}

export function buildBleedGuides(mode: "preview" | "final") {
  return mode === "final"
    ? `
      <rect x="35" y="35" width="1530" height="1530" fill="none" stroke="#d8cfc2" stroke-dasharray="12 10" />
      <rect x="80" y="80" width="1440" height="1440" fill="none" stroke="#c5b9a7" stroke-dasharray="8 6" />
    `
    : "";
}

export function decorativeGlyph(style: string) {
  switch (style) {
    case "adventure map":
      return "compass motifs and route marks";
    case "luxury":
      return "fine line frames and subtle laurel details";
    case "vintage":
      return "archival flourishes and stamp-style marks";
    case "cozy":
      return "soft florals and tucked-in keepsake doodles";
    case "rustic":
      return "woodcut-inspired leaves and stitched textures";
    case "playful":
      return "confetti arcs and lively spark shapes";
    default:
      return "editorial ornaments and soft geometric accents";
  }
}
