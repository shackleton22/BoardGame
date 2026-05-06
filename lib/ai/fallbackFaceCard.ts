import type { FaceCardWizardInput, ProjectOutputPayload } from "@/lib/validation/project";
import { sanitizePlainText } from "@/lib/utils";

const TILE_TYPES: ProjectOutputPayload["tiles"][number]["type"][] = [
  "clue",
  "challenge",
  "bonus",
  "twist",
  "reveal",
  "wildcard",
  "bonus",
  "challenge",
];

export function buildFallbackFaceCard(input: FaceCardWizardInput): ProjectOutputPayload {
  const sources = [
    ...input.people.map((person) => ({
      name: person.name,
      note:
        [person.role, person.tell, person.decoyTrait].filter(Boolean).join(" | ") ||
        "A familiar face with one very guessable detail.",
    })),
    ...input.cluePrompts.map((clue) => ({
      name: clue.name,
      note: clue.prompt || clue.note || "A hint category that helps narrow the table.",
    })),
  ];

  const padded = Array.from({ length: 32 }, (_, index) => {
    const item = sources[index % sources.length];
    return index < sources.length
      ? item
      : {
          name: sanitizePlainText(`${item.name} Tell ${Math.floor(index / sources.length) + 1}`, 40),
          note: item.note,
        };
  });

  return {
    title: sanitizePlainText(input.titleOverride || `${input.recipientName}'s Face Card`, 80),
    subtitle: sanitizePlainText(
      input.subtitleOverride ||
        "A personalized people-guessing game full of familiar faces, tells, decoys, and table-wide accusations.",
      140,
    ),
    themeSummary: sanitizePlainText(
      `A ${input.visualStyle}, ${input.colorMood} character board built from the people, habits, tells, and roles everyone recognizes.`,
      220,
    ),
    centerKicker: sanitizePlainText(
      input.revealMode || "Ask sharper hints, flip the wrong hunches, and find the mystery face.",
      120,
    ),
    boardSections: [
      {
        label: "Read the Room",
        description: "Start with broad hints and narrow the cast.",
      },
      {
        label: "Spot the Tell",
        description: "Use habits, roles, and decoys to eliminate options.",
      },
      {
        label: "Call the Bluff",
        description: "Challenge another player's hunch with a sharper hint.",
      },
      {
        label: "Reveal the Face",
        description: "Make the final guess and claim the reveal points.",
      },
    ],
    tiles: padded.map((item, index) => ({
      name: sanitizePlainText(item.name, 28),
      type: TILE_TYPES[index % TILE_TYPES.length],
      caption: sanitizePlainText(item.note, 90),
      points: [1, 2, 3, -1, 4, 0, 2, -2][index % 8],
    })),
    deckPrimaryLabel: "Hint Cards",
    deckSecondaryLabel: "Reveal Cards",
    deckPrimary: Array.from({ length: 24 }, (_, index) => {
      const clue = input.cluePrompts[index % input.cluePrompts.length];
      return {
        title: sanitizePlainText(clue.name, 40),
        body: sanitizePlainText(
          clue.prompt || `Ask a yes-or-no hint inspired by ${clue.name}.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 3 === 0 ? "Eliminate one extra face." : "Gain 2 hint points if the table laughs.",
          80,
        ),
      };
    }),
    deckSecondary: Array.from({ length: 24 }, (_, index) => {
      const person = input.people[index % input.people.length];
      return {
        title: sanitizePlainText(`Reveal: ${person.name}`, 40),
        body: sanitizePlainText(
          `Use ${person.tell || person.role || "a familiar tell"} to make or defend a final guess.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 4 === 0 ? "Correct guess: gain 4 points." : "Wrong guess: move back 1 space.",
          80,
        ),
      };
    }),
    rules: {
      objective:
        "Guess the mystery face by collecting hint points, eliminating decoys, and making the best final reveal.",
      setup: [
        "Place the board in the center and shuffle Hint Cards and Reveal Cards separately.",
        "Each player chooses a token and secretly picks one featured person as their mystery face.",
        "Use paper, coins, or the included markers to track hint points and eliminated faces.",
      ],
      turn: [
        "Roll one six-sided die and move forward along the board.",
        "Resolve the space, then draw a Hint or Reveal Card if instructed.",
        "Players may ask one yes-or-no question on hint spaces before making a final guess.",
      ],
      winning:
        "The first player to correctly reveal another player's mystery face gains a bonus; highest hint score after the final round wins.",
    },
    artPrompt: sanitizePlainText(
      `Premium people-guessing board artwork with portrait-card frames, playful hint motifs, ${input.visualStyle} styling, ${input.colorMood} palette, no text in the image.`,
      400,
    ),
    boardStyle: "party",
  };
}
