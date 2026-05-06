import type {
  MysteryNightWizardInput,
  ProjectOutputPayload,
} from "@/lib/validation/project";
import { sanitizePlainText } from "@/lib/utils";

const TILE_TYPES: ProjectOutputPayload["tiles"][number]["type"][] = [
  "clue",
  "bonus",
  "challenge",
  "alibi",
  "clue",
  "twist",
  "bonus",
  "reveal",
];

export function buildFallbackMysteryNight(
  input: MysteryNightWizardInput,
): ProjectOutputPayload {
  const suspects = input.suspects.map((suspect) => suspect.name);
  const sources = [
    ...input.locations.map((location: MysteryNightWizardInput["locations"][number]) => ({
      name: location.name,
      note:
        location.whyItMatters ||
        location.note ||
        "A favorite place that deserves a dramatic reveal.",
    })),
    ...input.clues.map((clue: MysteryNightWizardInput["clues"][number]) => ({
      name: clue.name,
      note:
        clue.story ||
        clue.note ||
        "A suspicious detail with personal history baked in.",
    })),
    ...input.suspects.map((suspect: MysteryNightWizardInput["suspects"][number]) => ({
      name: suspect.name,
      note:
        [suspect.role, suspect.trait, suspect.suspicionLevel]
          .filter(Boolean)
          .join(" | ") || "A memorable suspect with a suspiciously charming alibi.",
    })),
  ];

  const padded = Array.from({ length: 32 }, (_, index) => {
    const item = sources[index % sources.length];
    if (index < sources.length) {
      return item;
    }

    return {
      name: sanitizePlainText(`${item.name} Lead ${Math.floor(index / sources.length) + 1}`, 40),
      note: item.note,
    };
  });

  return {
    title: sanitizePlainText(
      input.titleOverride || `${input.recipientName}'s Case File`,
      80,
    ),
    subtitle: sanitizePlainText(
      input.subtitleOverride ||
        "A personalized case file full of favorite suspects, scenes, and suspiciously familiar evidence.",
      140,
    ),
    themeSummary: sanitizePlainText(
      `A ${input.visualStyle}, ${input.colorMood} mystery dossier inspired by ${input.recipientName}'s people, places, and inside stories.`,
      220,
    ),
    centerKicker: sanitizePlainText(
      `Case file: ${suspects.slice(0, 3).join(", ")}${suspects.length > 3 ? ", and more" : ""}`,
      120,
    ),
    boardSections: [
      {
        label: "Open the Case",
        description: "Set the scene with familiar faces, places, and suspicious details.",
      },
      {
        label: "Follow the Trail",
        description: "Gather evidence, compare stories, and uncover a few dramatic twists.",
      },
      {
        label: "Cross-Examine",
        description: "Test the table's memory with alibis, reveals, and callback moments.",
      },
      {
        label: "Solve the Night",
        description: "Finish the case with the strongest theory and the best keepsake score.",
      },
    ],
    tiles: padded.map((item, index) => ({
      name: sanitizePlainText(item.name, 28),
      type: TILE_TYPES[index % TILE_TYPES.length],
      caption: sanitizePlainText(item.note, 90),
      points: [2, 1, -1, 0, 3, -2, 2, 4][index % 8],
    })),
    deckPrimaryLabel: "Evidence Cards",
    deckSecondaryLabel: "Twist Cards",
    deckPrimary: Array.from({ length: 24 }, (_, index) => {
      const item = padded[index % padded.length];
      return {
        title: sanitizePlainText(`Evidence: ${item.name}`, 40),
        body: sanitizePlainText(
          `Read the evidence aloud and connect it to ${input.recipientName}'s real-life mystery lore.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 4 === 0 ? "Gain 2 evidence points." : "Move forward 1 space after sharing a theory.",
          80,
        ),
      };
    }),
    deckSecondary: Array.from({ length: 24 }, (_, index) => {
      const suspect = input.suspects[index % input.suspects.length];
      return {
        title: sanitizePlainText(`Twist: ${suspect.name}`, 40),
        body: sanitizePlainText(
          `A new angle appears. Give ${suspect.name} a better alibi, a worse alibi, or a dramatic reveal based on ${
            suspect.trait?.toLowerCase() || "their suspicious reputation"
          }.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 3 === 0 ? "Trade positions with the leader." : "Take an extra roll after the group votes.",
          80,
        ),
      };
    }),
    rules: {
      objective:
        "Collect the strongest case by earning evidence points, surviving twists, and finishing the final reveal lap.",
      setup: [
        "Place the board in the center and shuffle Evidence Cards and Twist Cards into separate decks.",
        "Each player chooses a keepsake token, coin, or figurine and starts at the opening case space.",
        "Track evidence points on paper or with coins nearby.",
      ],
      turn: [
        "Roll one six-sided die and move forward the matching number of spaces.",
        "Resolve the landed evidence, alibi, or twist before ending your turn.",
        "Whenever a card is drawn, read it aloud and let the group embellish the mystery together.",
      ],
      winning:
        "When all players reach the final reveal, the player with the most evidence points is crowned Lead Detective of the night.",
    },
    artPrompt: sanitizePlainText(
      `Premium mystery-board decorative artwork with corkboard and paper texture cues, ${input.visualStyle} styling, ${input.colorMood} palette, cinematic case-file mood, and no text in the image.`,
      400,
    ),
    boardStyle: "mystery",
  };
}
