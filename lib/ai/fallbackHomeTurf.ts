import type { HomeTurfWizardInput, ProjectOutputPayload } from "@/lib/validation/project";
import { sanitizePlainText } from "@/lib/utils";

const TILE_TYPES: ProjectOutputPayload["tiles"][number]["type"][] = [
  "memory",
  "reward",
  "challenge",
  "shortcut",
  "wildcard",
  "rest",
  "reward",
  "challenge",
];

export function buildFallbackHomeTurf(input: HomeTurfWizardInput): ProjectOutputPayload {
  const sources = [
    ...input.places.map((place) => ({
      name: place.name,
      note:
        place.whyItMatters ||
        place.vibe ||
        place.note ||
        "A meaningful stop on the map with a story behind it.",
    })),
    ...input.dealCards.map((deal) => ({
      name: deal.name,
      note:
        deal.prompt ||
        deal.note ||
        "A simple table prompt shaped by the group's home turf.",
    })),
  ];

  const padded = Array.from({ length: 32 }, (_, index) => {
    const item = sources[index % sources.length];
    return index < sources.length
      ? item
      : {
          name: sanitizePlainText(`${item.name} Stop ${Math.floor(index / sources.length) + 1}`, 40),
          note: item.note,
        };
  });

  return {
    title: sanitizePlainText(input.titleOverride || `${input.recipientName}'s Home Turf`, 80),
    subtitle: sanitizePlainText(
      input.subtitleOverride ||
        "A personalized place-collecting game about the spots, stories, shortcuts, and local legends that made the map yours.",
      140,
    ),
    themeSummary: sanitizePlainText(
      `A ${input.visualStyle}, ${input.colorMood} map of favorite places, running jokes, routes, story prompts, and home-field wins.`,
      220,
    ),
    centerKicker: sanitizePlainText(
      `Built from ${input.places.slice(0, 3).map((place) => place.name).join(", ")}${input.places.length > 3 ? ", and more" : ""}`,
      120,
    ),
    boardSections: [
      {
        label: "Claim the Map",
        description: "Visit favorite places and collect story points.",
      },
      {
        label: "Draw a Detour",
        description: "Cards add stories, shortcuts, table votes, and small bonuses.",
      },
      {
        label: "Take the Detour",
        description: "Shortcuts and setbacks turn the route into a shared story.",
      },
      {
        label: "Own the Night",
        description: "Finish with the best route, best stories, and most turf points.",
      },
    ],
    tiles: padded.map((item, index) => ({
      name: sanitizePlainText(item.name, 28),
      type: TILE_TYPES[index % TILE_TYPES.length],
      caption: sanitizePlainText(item.note, 90),
      points: [2, 3, -1, 1, 0, 2, 4, -2][index % 8],
    })),
    deckPrimaryLabel: "Local Legend Cards",
    deckSecondaryLabel: "Detour Cards",
    deckPrimary: Array.from({ length: 24 }, (_, index) => {
      const place = input.places[index % input.places.length];
      return {
        title: sanitizePlainText(place.name, 40),
        body: sanitizePlainText(
          `Tell the table why ${place.name} belongs on ${input.recipientName}'s map.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 3 === 0 ? "Gain 3 turf points." : "Move to the next reward space.",
          80,
        ),
      };
    }),
    deckSecondary: Array.from({ length: 24 }, (_, index) => {
      const deal = input.dealCards[index % input.dealCards.length];
      return {
        title: sanitizePlainText(deal.name, 40),
        body: sanitizePlainText(
          deal.prompt || `Resolve this detour with a quick story, vote, shortcut, or bonus inspired by ${deal.name}.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 4 === 0 ? "Gain 1 turf point after the table agrees." : "Move 1 space or take the next shortcut.",
          80,
        ),
      };
    }),
    rules: {
      objective:
        "Collect turf points by visiting meaningful places, drawing local legend cards, and making the best route around the board.",
      setup: [
        "Place the board in the center and shuffle Local Legend Cards and Detour Cards separately.",
        "Each player chooses any household token and starts at Home Base.",
        "Track turf points with coins, paper, or the included score markers.",
      ],
      turn: [
        "Roll one six-sided die and move forward along the route.",
        "Resolve the space you land on, then draw a card if instructed.",
        "Detour Cards resolve with quick stories, table votes, shortcuts, or small point bonuses.",
      ],
      winning:
        "After every player completes the final lap, the player with the most turf points wins the Home Turf crown.",
    },
    artPrompt: sanitizePlainText(
      `Premium custom map board artwork with route lines, neighborhood-inspired icons, ${input.visualStyle} styling, ${input.colorMood} palette, no text in the image.`,
      400,
    ),
    boardStyle: "journey",
  };
}
