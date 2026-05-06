import type {
  LifeQuestAIOutput,
  LifeQuestWizardInput,
  ProjectOutputPayload,
} from "@/lib/validation/project";
import { sanitizePlainText } from "@/lib/utils";

const TILE_TYPES: LifeQuestAIOutput["tiles"][number]["type"][] = [
  "memory",
  "reward",
  "challenge",
  "rest",
  "memory",
  "shortcut",
  "reward",
  "wildcard",
];

function sentenceFragment(value: string) {
  return value.trim().replace(/[.!?]+$/g, "").toLowerCase();
}

export function buildFallbackLifeQuest(input: LifeQuestWizardInput): LifeQuestAIOutput {
  const baseTitle = input.titleOverride || `${input.recipientName}'s Milestone Trail`;
  const subtitle =
    input.subtitleOverride ||
    "A keepsake journey through favorite places, milestones, and stories worth replaying.";

  const sourceItems = [...input.items];
  const paddedItems = Array.from({ length: 32 }, (_, index) => {
    const item = sourceItems[index % sourceItems.length];

    if (index < sourceItems.length) {
      return item;
    }

    return {
      ...item,
      name: sanitizePlainText(
        `${item.name} Encore ${Math.floor(index / sourceItems.length) + 1}`,
        40,
      ),
      whyItMatters:
        item.whyItMatters ||
        item.note ||
        `A little callback to ${input.recipientName}'s ${input.tone} story.`,
    };
  });

  const tiles = paddedItems.map((item, index) => ({
    name: sanitizePlainText(item.name, 28),
    type: TILE_TYPES[index % TILE_TYPES.length],
    caption: sanitizePlainText(
      item.whyItMatters ||
        item.note ||
        `Celebrate ${item.name.toLowerCase()} as one more chapter in the adventure.`,
      90,
    ),
    points: [2, 3, -1, 1, 4, 2, 3, 0][index % 8],
  }));

  const cardFactory = (
    kind: "memory" | "quest",
    index: number,
  ): LifeQuestAIOutput["memoryCards"][number] => {
    const item = paddedItems[index % paddedItems.length];
    const titlePrefix = kind === "memory" ? "Remember" : "Quest";
    const body =
      kind === "memory"
        ? `Share the story behind ${item.name.toLowerCase()} and why ${
            item.whyItMatters ? sentenceFragment(item.whyItMatters) : "it still gets brought up"
          }.`
        : `Bring ${item.name.toLowerCase()} energy to the table with a quick challenge inspired by ${
            item.whyItMatters ? sentenceFragment(item.whyItMatters) : "this chapter of the story"
          }.`;
    const effect =
      kind === "memory"
        ? `Gain ${1 + (index % 3)} keepsake point${index % 3 === 0 ? "" : "s"}.`
        : index % 4 === 0
          ? "Take an extra roll."
          : `Move forward ${1 + (index % 2)} spaces.`;

    return {
      title: sanitizePlainText(`${titlePrefix}: ${item.name}`, 40),
      body: sanitizePlainText(body, 180),
      effect: sanitizePlainText(effect, 80),
    };
  };

  return {
    title: sanitizePlainText(baseTitle, 80),
    subtitle: sanitizePlainText(subtitle, 140),
    themeSummary: sanitizePlainText(
      `A ${input.colorMood}, ${input.visualStyle} celebration of ${input.recipientName}'s favorite memories, places, and milestones with a ${input.tone} spirit.`,
      220,
    ),
    boardSections: [
      {
        label: "Origins",
        description: "Favorite beginnings, routines, and stories that shaped the early chapters.",
      },
      {
        label: "Highlights",
        description: "Trips, wins, and milestones that deserve their own spotlight.",
      },
      {
        label: "Shared Lore",
        description: "Chaotic, tender, and unforgettable moments only this group understands.",
      },
      {
        label: "Victory Lap",
        description: "A final loop packed with signature traits, cheers, and celebration.",
      },
    ],
    tiles,
    memoryCards: Array.from({ length: 24 }, (_, index) => cardFactory("memory", index)),
    questCards: Array.from({ length: 24 }, (_, index) => cardFactory("quest", index)),
    rules: {
      objective:
        "Travel the full journey, collect keepsake points, and finish the final lap with the strongest story-filled score.",
      setup: [
        "Place the board in the center and shuffle Memory Cards and Quest Cards into separate decks.",
        "Each player picks a coin, button, figurine, or keepsake as their token and starts at the first space.",
        "Keep a scrap of paper or notes app nearby to track keepsake points.",
      ],
      turn: [
        "Roll one six-sided die and move forward the matching number of spaces.",
        "Read the landed space aloud and resolve its points or prompt before ending your turn.",
        "Draw a Memory Card on marked memory moments and a Quest Card on quest moments.",
      ],
      winning:
        "When every player completes the final lap, the player with the most keepsake points wins and gets the honor of reading the closing tribute.",
    },
    artPrompt: sanitizePlainText(
      `Premium ${input.visualStyle} board-game decorative artwork in a ${input.colorMood} palette, elegant path map composition, modern editorial styling, and no text inside the artwork.`,
      400,
    ),
  };
}

export function normalizeLifeQuestOutput(output: LifeQuestAIOutput): ProjectOutputPayload {
  return {
    title: output.title,
    subtitle: output.subtitle,
    themeSummary: output.themeSummary,
    centerKicker: "A life worth replaying",
    boardSections: output.boardSections,
    tiles: output.tiles,
    deckPrimaryLabel: "Moment Cards",
    deckSecondaryLabel: "Milestone Cards",
    deckPrimary: output.memoryCards,
    deckSecondary: output.questCards,
    rules: output.rules,
    artPrompt: output.artPrompt,
    boardStyle: "journey",
  };
}
