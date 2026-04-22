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

export function buildFallbackInsideJokeShowdown(
  input: InsideJokeShowdownWizardInput,
): ProjectOutputPayload {
  const references = [
    ...input.insideJokes.map((item: InsideJokeShowdownWizardInput["insideJokes"][number]) => ({
      name: item.name,
      note: item.note ?? "A recurring bit that instantly gets the whole table laughing.",
    })),
    ...input.rapidChallenges.map(
      (item: InsideJokeShowdownWizardInput["rapidChallenges"][number]) => ({
      name: item.name,
      note: item.note ?? "A quick challenge that deserves a dramatic reenactment.",
      }),
    ),
    ...input.catchphrases.map((phrase: string) => ({
      name: phrase,
      note: "A line everyone can hear in exactly the right voice.",
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
      input.titleOverride || `${input.recipientName}'s Inside Joke Showdown`,
      80,
    ),
    subtitle: sanitizePlainText(
      input.subtitleOverride ||
        "A party-night keepsake packed with callbacks, challenges, and signature lines from the group.",
      140,
    ),
    themeSummary: sanitizePlainText(
      `A ${input.visualStyle}, ${input.colorMood} party board built from the friend group's best bits, fastest challenges, and most repeated lines.`,
      220,
    ),
    centerKicker: "Fast laughs. Real memories. One final bragging title.",
    boardSections: [
      {
        label: "Warm-Up",
        description: "Call up the classic bits and set the energy for the night.",
      },
      {
        label: "Callout Round",
        description: "Test the table's recall with catchphrases, chaos, and mini dares.",
      },
      {
        label: "Double Down",
        description: "Raise the stakes with remixes, rivalries, and dramatic retellings.",
      },
      {
        label: "Final Flex",
        description: "Close the showdown with the loudest laughs and the biggest score.",
      },
    ],
    tiles: padded.map((item, index) => ({
      name: sanitizePlainText(item.name, 28),
      type: TILE_TYPES[index % TILE_TYPES.length],
      caption: sanitizePlainText(item.note, 90),
      points: [1, -1, 3, 0, 2, 2, 4, 1][index % 8],
    })),
    deckPrimaryLabel: "Callout Cards",
    deckSecondaryLabel: "Challenge Cards",
    deckPrimary: Array.from({ length: 24 }, (_, index) => {
      const phrase = input.catchphrases[index % input.catchphrases.length];
      return {
        title: sanitizePlainText(`Callout: ${phrase}`, 40),
        body: sanitizePlainText(
          `Tell the table when this line appears, who says it best, or how it became part of the group's vocabulary.`,
          180,
        ),
        effect: sanitizePlainText(
          index % 4 === 0 ? "Gain 2 laugh points." : "Move forward 1 space after the vote.",
          80,
        ),
      };
    }),
    deckSecondary: Array.from({ length: 24 }, (_, index) => {
      const challenge = input.rapidChallenges[index % input.rapidChallenges.length];
      return {
        title: sanitizePlainText(`Challenge: ${challenge.name}`, 40),
        body: sanitizePlainText(
          challenge.note ||
            "Act it out, rank it, retell it, or nominate the person most likely to start it.",
          180,
        ),
        effect: sanitizePlainText(
          index % 3 === 0 ? "Take an extra roll if the table laughs." : "Gain 1 point if everyone joins in.",
          80,
        ),
      };
    }),
    rules: {
      objective:
        "Collect laugh points by landing on callback spaces, winning mini challenges, and completing the final showdown lap.",
      setup: [
        "Place the board in the center and shuffle Callout Cards and Challenge Cards into separate decks.",
        "Each player chooses any household token and starts on the first space.",
        "Keep coins, buttons, or notes nearby to track laugh points.",
      ],
      turn: [
        "Roll one six-sided die and move forward the matching number of spaces.",
        "Resolve the landed callback, challenge, or bonus space before ending your turn.",
        "Whenever a card is drawn, read it aloud and let the table decide who earned the points.",
      ],
      winning:
        "Once everyone completes the final lap, the player with the most laugh points wins the showdown and the closing toast.",
    },
    artPrompt: sanitizePlainText(
      `Premium party-board decorative artwork with playful ribbons, paper-cut shapes, lively confetti arcs, ${input.visualStyle} styling, ${input.colorMood} palette, and no text inside the image.`,
      400,
    ),
    boardStyle: "party",
  };
}
