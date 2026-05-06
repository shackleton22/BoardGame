import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";

import type { TemplateExampleProof } from "@/lib/templates/example-proofs";
import type { TemplateSlug } from "@/lib/templates/types";

type OverlayLabel = {
  x: number;
  y: number;
  width: number;
  title: string;
  subtitle?: string;
};

const SHOWCASE_OVERLAYS: Record<
  TemplateSlug,
  {
    title: string;
    subtitle: string;
    labels: OverlayLabel[];
  }
> = {
  "home-turf": {
    title: "RACHEL'S HOME TURF",
    subtitle: "Birthday map of favorite places",
    labels: [
      { x: 20, y: 18, width: 13, title: "Maple Street" },
      { x: 43, y: 18, width: 11, title: "Taco Patio" },
      { x: 66, y: 18, width: 12, title: "Bookstore" },
      { x: 16, y: 50, width: 11, title: "Lake Weekend" },
      { x: 73, y: 51, width: 11, title: "Dog Park" },
      { x: 43, y: 82, width: 13, title: "Fire Pit" },
    ],
  },
  "milestone-trail": {
    title: "AVERY'S MILESTONE TRAIL",
    subtitle: "An anniversary journey board",
    labels: [
      { x: 19, y: 16, width: 13, title: "First Apartment" },
      { x: 41, y: 16, width: 11, title: "Rainy Walk" },
      { x: 61, y: 16, width: 12, title: "Blue Ridge" },
      { x: 33, y: 53, width: 12, title: "Pancakes" },
      { x: 58, y: 53, width: 11, title: "Job Toast" },
      { x: 72, y: 76, width: 13, title: "Movie Blanket" },
    ],
  },
  "face-card": {
    title: "PARKER FAMILY REUNION",
    subtitle: "Guess the family legend",
    labels: [
      { x: 29.8, y: 42.3, width: 16.5, title: "AUNT LENA", subtitle: "Dessert Commander" },
      { x: 49.9, y: 42.3, width: 16.5, title: "UNCLE ROB", subtitle: "Grill Philosopher" },
      { x: 69.9, y: 42.3, width: 16.5, title: "COUSIN TESS", subtitle: "Group Photographer" },
      { x: 29.8, y: 65, width: 16.5, title: "GRANDPA JOE", subtitle: "Story Archivist" },
      { x: 49.9, y: 65, width: 16.5, title: "MILO", subtitle: "Snack Inspector" },
      { x: 69.9, y: 65, width: 16.5, title: "BEA", subtitle: "Playlist Boss" },
    ],
  },
  "case-file": {
    title: "MORGAN'S CASE FILE",
    subtitle: "A funny friendship investigation",
    labels: [
      { x: 13, y: 34, width: 13, title: "Cabin Kitchen" },
      { x: 31, y: 35, width: 12, title: "Photo Booth" },
      { x: 55, y: 35, width: 12, title: "Last Table" },
      { x: 74, y: 34, width: 12, title: "Coffee Order" },
      { x: 27, y: 74, width: 13, title: "Glitter Receipt" },
      { x: 62, y: 73, width: 12, title: "Half Playlist" },
    ],
  },
  "trivia-trek": {
    title: "SAM'S TRIVIA TREK",
    subtitle: "Birthday group-lore challenge",
    labels: [
      { x: 50, y: 15, width: 14, title: "Road Trip Rules" },
      { x: 70, y: 33, width: 12, title: "Brunch Lore" },
      { x: 70, y: 61, width: 11, title: "Pet Chaos" },
      { x: 50, y: 78, width: 12, title: "Karaoke Night" },
      { x: 30, y: 61, width: 12, title: "Gas Stop" },
      { x: 30, y: 33, width: 12, title: "Snack Vote" },
    ],
  },
};

function overlayText(value: string, x: number, y: number, size: number, weight = 900) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize={size}
      fontWeight={weight}
      letterSpacing={size > 2 ? 0.22 : 0.05}
      fill="#22150d"
    >
      {value}
    </text>
  );
}

function label(label: OverlayLabel) {
  return (
    <g key={`${label.title}-${label.x}-${label.y}`}>
      <rect
        x={label.x - label.width / 2}
        y={label.y - 2.65}
        width={label.width}
        height={label.subtitle ? 4.3 : 3.35}
        rx={0.65}
        fill="#f8e8c7"
        stroke="#6a4524"
        strokeWidth={0.22}
        opacity={0.96}
      />
      {overlayText(label.title, label.x, label.y - 0.55, label.title.length > 13 ? 1.35 : 1.5)}
      {label.subtitle ? overlayText(label.subtitle, label.x, label.y + 1.1, 0.92, 800) : null}
    </g>
  );
}

function ShowcaseTextOverlay({ slug }: { slug: TemplateSlug }) {
  const overlay = SHOWCASE_OVERLAYS[slug];

  if (!overlay) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={`showcase-shadow-${slug}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.45" stdDeviation="0.32" floodColor="#1d1209" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#showcase-shadow-${slug})`}>
        <rect x="27" y="3.9" width="46" height="7.2" rx="1" fill="#f8e8c7" stroke="#6a4524" strokeWidth="0.28" />
        {overlayText(overlay.title, 50, 6.75, overlay.title.length > 22 ? 1.65 : 1.85)}
        {overlayText(overlay.subtitle, 50, 9.05, 1, 800)}
      </g>
      <g filter={`url(#showcase-shadow-${slug})`}>{overlay.labels.map(label)}</g>
    </svg>
  );
}

export function ExampleBoardImage({
  example,
  alt,
  className = "",
}: {
  example: TemplateExampleProof;
  alt: string;
  className?: string;
}) {
  const generatedShowcasePath = path.join(
    process.cwd(),
    "public",
    "template-showcase",
    `${example.slug}.png`,
  );

  if (existsSync(generatedShowcasePath)) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={`/template-showcase/${example.slug}.png`}
          alt={alt}
          width={2048}
          height={2048}
          unoptimized
          className="block h-auto w-full select-none object-cover"
        />
        <ShowcaseTextOverlay slug={example.slug} />
      </div>
    );
  }

  const svg = example.showcaseSvg || example.boardSvg;
  return (
    <Image
      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
      alt={alt}
      width={1600}
      height={1600}
      unoptimized
      className={`block h-auto w-full select-none object-cover ${className}`}
    />
  );
}
