import type { TemplateSlug } from "@/lib/templates/types";

type PreviewArtProfile = {
  bgA: string;
  bgB: string;
  accent: string;
  accentTwo: string;
  ink: string;
  boardFill: string;
  cardFill: string;
  motif: "map" | "trail" | "faces" | "case" | "trivia";
};

const PROFILES: Record<TemplateSlug, PreviewArtProfile> = {
  "home-turf": {
    bgA: "#f7ead6",
    bgB: "#d8e6d6",
    accent: "#2f6f62",
    accentTwo: "#c77945",
    ink: "#203642",
    boardFill: "#fff7e8",
    cardFill: "#fefcf7",
    motif: "map",
  },
  "milestone-trail": {
    bgA: "#f9e4cf",
    bgB: "#e6d3bb",
    accent: "#9f7457",
    accentTwo: "#29475b",
    ink: "#2a211b",
    boardFill: "#fff9ef",
    cardFill: "#fffdf8",
    motif: "trail",
  },
  "face-card": {
    bgA: "#ffe3cf",
    bgB: "#dbeafe",
    accent: "#e07a5f",
    accentTwo: "#355070",
    ink: "#1f2937",
    boardFill: "#fff7f0",
    cardFill: "#fffaf4",
    motif: "faces",
  },
  "case-file": {
    bgA: "#ded2bd",
    bgB: "#9aa39b",
    accent: "#8b2f2f",
    accentTwo: "#263238",
    ink: "#211915",
    boardFill: "#f7ecd7",
    cardFill: "#fff8e8",
    motif: "case",
  },
  "trivia-trek": {
    bgA: "#dff2ff",
    bgB: "#fff1bf",
    accent: "#2563eb",
    accentTwo: "#f59e0b",
    ink: "#172554",
    boardFill: "#fffdf7",
    cardFill: "#ffffff",
    motif: "trivia",
  },
};

const TITLES: Record<TemplateSlug, string> = {
  "home-turf": "Home Turf",
  "milestone-trail": "Milestone Trail",
  "face-card": "Face Card",
  "case-file": "Case File",
  "trivia-trek": "Trivia Trek",
};

export function buildTemplatePreviewImageDataUrl(slug: TemplateSlug) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildTemplatePreviewSvg(slug))}`;
}

export function buildTemplateDecorativeImageDataUrl(slug: TemplateSlug) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildTemplateDecorativeSvg(slug))}`;
}

function buildTemplatePreviewSvg(slug: TemplateSlug) {
  const profile = PROFILES[slug];
  const motif = buildMotif(profile);
  const title = TITLES[slug];

  return `
<svg width="1400" height="1050" viewBox="0 0 1400 1050" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} product preview">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${profile.bgA}"/>
      <stop offset="100%" stop-color="${profile.bgB}"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="18%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#1f160f" flood-opacity="0.22"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1f160f" flood-opacity="0.16"/>
    </filter>
    <pattern id="grain" width="90" height="90" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="18" r="1.6" fill="#ffffff" opacity="0.18"/>
      <circle cx="58" cy="42" r="1.2" fill="#1f160f" opacity="0.08"/>
      <circle cx="34" cy="76" r="1.4" fill="#ffffff" opacity="0.14"/>
    </pattern>
  </defs>

  <rect width="1400" height="1050" rx="56" fill="url(#bg)"/>
  <rect width="1400" height="1050" rx="56" fill="url(#glow)"/>
  <rect width="1400" height="1050" rx="56" fill="url(#grain)"/>

  <ellipse cx="748" cy="915" rx="438" ry="58" fill="#1f160f" opacity="0.14"/>

  <g transform="translate(170 126) rotate(-5)" filter="url(#shadow)">
    <rect x="0" y="0" width="545" height="690" rx="42" fill="${profile.boardFill}" stroke="${profile.ink}" stroke-width="7"/>
    <rect x="32" y="34" width="481" height="622" rx="34" fill="#ffffff" opacity="0.46"/>
    ${motif}
    <rect x="76" y="510" width="394" height="96" rx="24" fill="#ffffff" opacity="0.78"/>
    <text x="273" y="566" text-anchor="middle" font-size="48" font-family="Georgia, serif" font-weight="700" fill="${profile.ink}">${title}</text>
  </g>

  <g transform="translate(725 132) rotate(7)" filter="url(#shadow)">
    <path d="M38 0h364c31 0 56 25 56 56v614c0 31-25 56-56 56H38c-21 0-38-17-38-38V38C0 17 17 0 38 0Z" fill="${profile.ink}"/>
    <path d="M58 38h314c26 0 48 22 48 48v548c0 26-22 48-48 48H58V38Z" fill="${profile.cardFill}"/>
    <path d="M80 84h270c18 0 32 14 32 32v220c0 18-14 32-32 32H80V84Z" fill="${profile.bgA}" opacity="0.82"/>
    <circle cx="150" cy="172" r="44" fill="${profile.accent}" opacity="0.86"/>
    <circle cx="258" cy="232" r="66" fill="${profile.accentTwo}" opacity="0.76"/>
    <path d="M86 432h288M86 486h240M86 540h278" stroke="${profile.ink}" stroke-width="16" stroke-linecap="round" opacity="0.18"/>
    <rect x="86" y="600" width="166" height="40" rx="20" fill="${profile.accent}" opacity="0.86"/>
  </g>

  <g transform="translate(746 660) rotate(-10)" filter="url(#softShadow)">
    <rect x="0" y="0" width="210" height="292" rx="28" fill="${profile.cardFill}" stroke="${profile.ink}" stroke-width="5"/>
    <circle cx="105" cy="110" r="54" fill="${profile.accent}" opacity="0.82"/>
    <path d="M54 202h104M54 236h78" stroke="${profile.ink}" stroke-width="13" stroke-linecap="round" opacity="0.22"/>
  </g>

  <g transform="translate(960 602) rotate(9)" filter="url(#softShadow)">
    <rect x="0" y="0" width="210" height="292" rx="28" fill="${profile.cardFill}" stroke="${profile.ink}" stroke-width="5"/>
    <rect x="48" y="66" width="114" height="94" rx="26" fill="${profile.accentTwo}" opacity="0.82"/>
    <path d="M54 202h104M54 236h78" stroke="${profile.ink}" stroke-width="13" stroke-linecap="round" opacity="0.22"/>
  </g>

  <g transform="translate(1070 222)" filter="url(#softShadow)">
    <circle cx="62" cy="62" r="54" fill="#fffdf7" stroke="${profile.ink}" stroke-width="5"/>
    <circle cx="45" cy="48" r="6" fill="${profile.ink}"/>
    <circle cx="78" cy="48" r="6" fill="${profile.ink}"/>
    <circle cx="62" cy="78" r="6" fill="${profile.ink}"/>
  </g>

  <g transform="translate(1005 338)" filter="url(#softShadow)">
    <path d="M0 92c0-34 28-62 62-62s62 28 62 62-28 62-62 62S0 126 0 92Z" fill="${profile.accent}" opacity="0.9"/>
    <path d="M62 0l42 52H20L62 0Z" fill="${profile.accentTwo}"/>
  </g>
</svg>`.trim();
}

function buildTemplateDecorativeSvg(slug: TemplateSlug) {
  const profile = PROFILES[slug];
  const motif = buildMotif(profile);

  return `
<svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative game artwork">
  <defs>
    <linearGradient id="artBg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${profile.bgA}"/>
      <stop offset="100%" stop-color="${profile.bgB}"/>
    </linearGradient>
    <radialGradient id="artGlow" cx="42%" cy="36%" r="68%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.64"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="120" height="120" patternUnits="userSpaceOnUse">
      <circle cx="18" cy="22" r="5" fill="${profile.accent}" opacity="0.12"/>
      <circle cx="86" cy="72" r="4" fill="${profile.accentTwo}" opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="1600" height="1600" fill="url(#artBg)"/>
  <rect width="1600" height="1600" fill="url(#artGlow)"/>
  <rect width="1600" height="1600" fill="url(#dots)"/>
  <circle cx="250" cy="260" r="190" fill="${profile.accent}" opacity="0.16"/>
  <circle cx="1320" cy="310" r="240" fill="${profile.accentTwo}" opacity="0.16"/>
  <circle cx="1180" cy="1290" r="280" fill="#ffffff" opacity="0.22"/>
  <g transform="translate(185 210) scale(2.15)" opacity="0.56">
    ${motif}
  </g>
  <g transform="translate(940 820) rotate(12)" opacity="0.36">
    <rect x="0" y="0" width="300" height="420" rx="42" fill="#ffffff" stroke="${profile.ink}" stroke-width="8"/>
    <circle cx="150" cy="150" r="86" fill="${profile.accent}" opacity="0.78"/>
    <path d="M76 292h154M76 344h118" stroke="${profile.ink}" stroke-width="22" stroke-linecap="round" opacity="0.16"/>
  </g>
</svg>`.trim();
}

function buildMotif(profile: PreviewArtProfile) {
  if (profile.motif === "map") {
    return `
      <path d="M92 168C168 86 236 266 318 190s128 12 132 84-64 118-156 104-134 94-218 36" fill="none" stroke="${profile.accent}" stroke-width="18" stroke-linecap="round" opacity="0.68"/>
      <path d="M86 310c96-38 156 10 224-56 58-56 112-62 168-20" fill="none" stroke="${profile.accentTwo}" stroke-width="10" stroke-dasharray="24 22" stroke-linecap="round"/>
      ${[110, 212, 328, 420]
        .map(
          (x, i) =>
            `<g transform="translate(${x} ${i % 2 ? 246 : 174})"><path d="M0-38c21 0 38 17 38 38 0 31-38 72-38 72S-38 31-38 0c0-21 17-38 38-38Z" fill="${i % 2 ? profile.accentTwo : profile.accent}"/><circle r="14" fill="#fff"/></g>`,
        )
        .join("")}
    `;
  }

  if (profile.motif === "trail") {
    return `
      <path d="M98 420C134 240 214 132 326 162c116 31 126 180 36 224-88 42-172-32-122-118 42-72 154-34 212 38" fill="none" stroke="${profile.accent}" stroke-width="20" stroke-linecap="round" opacity="0.64"/>
      <path d="M112 138h108v86H112zM328 92h118v96H328zM84 304h122v94H84z" fill="#fff" stroke="${profile.ink}" stroke-width="5" opacity="0.92"/>
      <circle cx="166" cy="181" r="24" fill="${profile.accentTwo}" opacity="0.78"/>
      <circle cx="388" cy="140" r="28" fill="${profile.accent}" opacity="0.78"/>
      <path d="M112 462h330" stroke="${profile.ink}" stroke-width="16" stroke-linecap="round" opacity="0.14"/>
    `;
  }

  if (profile.motif === "faces") {
    return Array.from({ length: 9 }, (_, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 92 + col * 132;
      const y = 92 + row * 128;
      return `
        <g transform="translate(${x} ${y})">
          <rect x="0" y="0" width="96" height="112" rx="26" fill="#fff" stroke="${profile.ink}" stroke-width="4"/>
          <circle cx="48" cy="42" r="23" fill="${index % 2 ? profile.accentTwo : profile.accent}" opacity="0.82"/>
          <path d="M25 88c14-24 33-31 46 0" fill="none" stroke="${profile.ink}" stroke-width="8" stroke-linecap="round" opacity="0.22"/>
        </g>
      `;
    }).join("");
  }

  if (profile.motif === "case") {
    return `
      <rect x="76" y="86" width="390" height="370" rx="24" fill="#d2b48c" opacity="0.46"/>
      <path d="M118 166h142M118 224h240M118 282h176" stroke="${profile.ink}" stroke-width="13" stroke-linecap="round" opacity="0.22"/>
      <circle cx="152" cy="382" r="40" fill="${profile.accent}" opacity="0.86"/>
      <circle cx="394" cy="160" r="38" fill="${profile.accentTwo}" opacity="0.86"/>
      <circle cx="376" cy="360" r="34" fill="${profile.accent}" opacity="0.72"/>
      <path d="M152 382L394 160M394 160l-18 200M152 382l224-22" stroke="${profile.accent}" stroke-width="8" stroke-linecap="round" opacity="0.82"/>
    `;
  }

  return `
    <path d="M92 386c42-172 160-270 330-294" fill="none" stroke="${profile.accent}" stroke-width="18" stroke-linecap="round" opacity="0.7"/>
    ${Array.from({ length: 10 }, (_, index) => {
      const x = 88 + (index % 5) * 84;
      const y = 122 + Math.floor(index / 5) * 138;
      const color = index % 2 ? profile.accentTwo : profile.accent;
      return `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="62" height="62" rx="18" fill="${color}" opacity="0.86"/><circle cx="31" cy="31" r="8" fill="#fff"/></g>`;
    }).join("")}
    <path d="M108 438h330" stroke="${profile.ink}" stroke-width="16" stroke-linecap="round" opacity="0.14"/>
  `;
}
