import type {
  InsideJokeShowdownWizardInput,
  ProjectOutputPayload,
} from "@/lib/validation/project";
import { sanitizePlainText } from "@/lib/utils";

const TILE_TYPES: ProjectOutputPayload["tiles"][number]["type"][] = [
  "bonus",
  "challenge",
  "double_down",
  "rest",
  "bonus",
  "shortcut",
  "reward",
  "wildcard",
];

function sentenceFragment(value: string) {
  return value.trim().replace(/[.!?]+$/g, "").toLowerCase();
}

export function buildFallbackInsideJokeShowdown(
  input: InsideJokeShowdownWizardInput,
): ProjectOutputPayload {
  const references = [
    ...input.insideJokes.map((item: InsideJokeShowdownWizardInput["insideJokes"][number]) => ({
      name: item.name,
      note:
        item.whyItMatters ||
        item.factOne ||
        item.note ||
        "A recurring topic the whole table should know cold.",
    })),
    ...input.rapidChallenges.map(
      (item: InsideJokeShowdownWizardInput["rapidChallenges"][number]) => ({
      name: item.name,
      note:
        item.prompt ||
        item.note ||
        "A bonus prompt that can swing the score at the last second.",
      }),
    ),
    ...input.catchphrases.map((phrase: string) => ({
      name: phrase,
      note: "A signature answer, quote, or callback everyone should recognize.",
    })),
  ];

  const padded = Array.from({ length: 32 }, (_, index) => {
    const item = references[index % references.length];
    if (index < references.length) {
      return item;
    }

    return {
      name: sanitizePlainText(`${item.name} Remix ${Math.floor(index / references.length) + 1}`, 40),
      note: item.note,
    };
  });

  return {
    title: sanitizePlainText(
      input.titleOverride || `${input.recipientName}'s Trivia Trek`,
      80,
    ),
    subtitle: sanitizePlainText(
      input.subtitleOverride ||
        "A personalized trivia board packed with stories, categories, bonus rounds, and signature answers.",
      140,
    ),
    themeSummary: sanitizePlainText(
      `A ${input.visualStyle}, ${input.colorMood} trivia board built from the group's favorite categories, answer anchors, callbacks, and bonus rounds.`,
      220,
    ),
    centerKicker: "Question. Guess. Celebrate.",
    boardSections: [
      {
        label: "Warm-Up",
        description: "Start with the stories, categories, and memory hooks everyone recognizes.",
      },
      {
        label: "Memory Lane",
        description: "Test the table's recall with personal trivia, callback details, and shared lore.",
      },
      {
        label: "Bonus Round",
        description: "Raise the stakes with tie-breakers, close calls, and risk-reward prompts.",
      },
      {
        label: "Final Question",
        description: "Close the game with the toughest prompt and the biggest score swing.",
      },
    ],
    tiles: padded.map((item, index) => ({
      name: sanitizePlainText(item.name, 28),
      type: TILE_TYPES[index % TILE_TYPES.length],
      caption: sanitizePlainText(item.note, 90),
      points: [1, -1, 3, 0, 2, 2, 4, 1][index % 8],
    })),
    deckPrimaryLabel: "Question Cards",
    deckSecondaryLabel: "Bonus Cards",
    deckPrimary: Array.from({ length: 24 }, (_, index) => {
      const topic = input.insideJokes[index % input.insideJokes.length];
      const clueLine =
        topic.factOne || topic.factTwo || topic.factThree || topic.note || "shared lore";
      return {
        title: sanitizePlainText(`Question: ${topic.name}`, 40),
        body: sanitizePlainText(
          `Ask the table to connect ${topic.name.toLowerCase()} to ${sentenceFragment(clueLine)} and explain why it belongs in ${input.recipientName}'s trivia set.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 4 === 0 ? "Gain 2 score points for a perfect answer." : "Move forward 1 space after the guess.",
          80,
        ),
      };
    }),
    deckSecondary: Array.from({ length: 24 }, (_, index) => {
      const challenge = input.rapidChallenges[index % input.rapidChallenges.length];
      return {
        title: sanitizePlainText(`Bonus: ${challenge.name}`, 40),
        body: sanitizePlainText(
          challenge.prompt ||
            challenge.note ||
            "Use this as a tie-breaker, speed round, or bonus point challenge for the table.",
          180,
        ),
        effect: sanitizePlainText(
          challenge.difficulty === "hard"
            ? "Gain 2 bonus points if the table agrees."
            : index % 3 === 0
              ? "Take an extra roll if the table agrees."
              : "Gain 1 bonus point for the closest answer.",
          80,
        ),
      };
    }),
    rules: {
      objective:
        "Collect score points by answering personalized trivia prompts, winning bonus rounds, and completing the final question lap.",
      setup: [
        "Place the board in the center and shuffle Question Cards and Bonus Cards into separate decks.",
        "Each player chooses any household token and starts on the first space.",
        "Keep coins, buttons, or notes nearby to track score points.",
      ],
      turn: [
        "Roll one six-sided die and move forward the matching number of spaces.",
        "Resolve the landed trivia, bonus, or challenge space before ending your turn.",
        "Whenever a card is drawn, read it aloud and let the table decide who earned the points.",
      ],
      winning:
        "Once everyone completes the final lap, the player with the most score points wins the trivia trek and the closing bragging rights.",
    },
    artPrompt: sanitizePlainText(
      `Premium trivia-board decorative artwork with playful paper-cut shapes, category markers, confident editorial layout cues, ${input.visualStyle} styling, ${input.colorMood} palette, and no text inside the image.`,
      400,
    ),
    boardStyle: "party",
  };
}
