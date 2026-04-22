import type {
  InsideJokeShowdownWizardInput,
  LifeQuestWizardInput,
  MysteryNightWizardInput,
} from "@/lib/validation/project";

export const LIFE_QUEST_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "themeSummary",
    "boardSections",
    "tiles",
    "memoryCards",
    "questCards",
    "rules",
    "artPrompt",
  ],
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    themeSummary: { type: "string" },
    boardSections: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "description"],
        properties: {
          label: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    tiles: {
      type: "array",
      minItems: 32,
      maxItems: 32,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "type", "caption", "points"],
        properties: {
          name: { type: "string" },
          type: {
            type: "string",
            enum: [
              "memory",
              "challenge",
              "reward",
              "shortcut",
              "rest",
              "wildcard",
            ],
          },
          caption: { type: "string" },
          points: { type: "integer" },
        },
      },
    },
    memoryCards: {
      type: "array",
      minItems: 24,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "effect"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          effect: { type: "string" },
        },
      },
    },
    questCards: {
      type: "array",
      minItems: 24,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "effect"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          effect: { type: "string" },
        },
      },
    },
    rules: {
      type: "object",
      additionalProperties: false,
      required: ["objective", "setup", "turn", "winning"],
      properties: {
        objective: { type: "string" },
        setup: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: { type: "string" },
        },
        turn: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: { type: "string" },
        },
        winning: { type: "string" },
      },
    },
    artPrompt: { type: "string" },
  },
} as const;

export const GENERIC_GAME_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "themeSummary",
    "centerKicker",
    "boardSections",
    "tiles",
    "deckPrimaryLabel",
    "deckSecondaryLabel",
    "deckPrimary",
    "deckSecondary",
    "rules",
    "artPrompt",
    "boardStyle",
  ],
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    themeSummary: { type: "string" },
    centerKicker: { type: "string" },
    boardSections: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "description"],
        properties: {
          label: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    tiles: {
      type: "array",
      minItems: 32,
      maxItems: 32,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "type", "caption", "points"],
        properties: {
          name: { type: "string" },
          type: {
            type: "string",
            enum: [
              "memory",
              "challenge",
              "reward",
              "shortcut",
              "rest",
              "wildcard",
              "clue",
              "twist",
              "alibi",
              "reveal",
              "bonus",
              "double_down",
            ],
          },
          caption: { type: "string" },
          points: { type: "integer" },
        },
      },
    },
    deckPrimaryLabel: { type: "string" },
    deckSecondaryLabel: { type: "string" },
    deckPrimary: {
      type: "array",
      minItems: 24,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "effect"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          effect: { type: "string" },
        },
      },
    },
    deckSecondary: {
      type: "array",
      minItems: 24,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "effect"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          effect: { type: "string" },
        },
      },
    },
    rules: {
      type: "object",
      additionalProperties: false,
      required: ["objective", "setup", "turn", "winning"],
      properties: {
        objective: { type: "string" },
        setup: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: { type: "string" },
        },
        turn: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: { type: "string" },
        },
        winning: { type: "string" },
      },
    },
    artPrompt: { type: "string" },
    boardStyle: {
      type: "string",
      enum: ["journey", "mystery", "party"],
    },
  },
} as const;

const COMMON_SYSTEM_RULES = `
You are creating premium, legally distinct personalized board-game gift copy for GameGift Studio.
Respond with JSON only.
Do not mention Monopoly, Clue, Hasbro, or any real board-game brand.
Do not imitate protected visual or gameplay trade dress.
Keep language family-friendly, giftable, warm, and specific to the customer.
Use the customer's details heavily and make the game feel personal rather than generic.
Tile names must stay short enough for print layout.
Generate exactly 32 tiles and exactly 24 cards in each deck.
Avoid trademarked brand names unless the customer supplied them as personal context, and even then avoid making them product branding.
All customer-visible text will be rendered separately, so do not ask the image model to draw any text.
`.trim();

export const LIFE_QUEST_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original personalized path-style board game called "Life Quest Board".`;

export const MYSTERY_NIGHT_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original cooperative keepsake mystery game called "Mystery Night".`;

export const INSIDE_JOKE_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original party-style keepsake game called "Inside Joke Showdown".`;

function formatList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

export function buildLifeQuestPrompt(input: LifeQuestWizardInput) {
  const items = input.items
    .map(
      (item: LifeQuestWizardInput["items"][number], index: number) =>
        `${index + 1}. ${item.name} [${item.category}]${
          item.note ? ` - ${item.note}` : ""
        }`,
    )
    .join("\n");

  return `
Create a premium personalized board-game gift concept for the following Life Quest project.

Recipient: ${input.recipientName}
Buyer: ${input.buyerName}
Occasion: ${input.occasion}
Tone: ${input.tone}
Relationship: ${input.relationship}
Visual style: ${input.visualStyle}
Color mood: ${input.colorMood}
Title override: ${input.titleOverride ?? "none"}
Subtitle override: ${input.subtitleOverride ?? "none"}
Things to avoid: ${input.avoidNotes ?? "none"}

Personal details to use heavily:
${items}

Rules:
- Make the game feel thoughtful, premium, and emotionally resonant.
- Blend heartfelt and playful copy based on the requested tone.
- If fewer than 32 details are provided, intelligently expand the journey with adjacent memories, recurring motifs, celebration moments, and original filler that still feels personal.
- The game is for 2-6 players using one six-sided die and household tokens.
- Include short point effects on tiles and cards.
- Keep captions concise and printable.
  `.trim();
}

export function buildMysteryNightPrompt(input: MysteryNightWizardInput) {
  return `
Create a premium personalized cooperative mystery game for the following project.

Recipient: ${input.recipientName}
Buyer: ${input.buyerName}
Occasion: ${input.occasion}
Tone: ${input.tone}
Relationship: ${input.relationship}
Visual style: ${input.visualStyle}
Color mood: ${input.colorMood}
Title override: ${input.titleOverride ?? "none"}
Subtitle override: ${input.subtitleOverride ?? "none"}
Things to avoid: ${input.avoidNotes ?? "none"}
Optional reveal twist: ${input.revealTwist ?? "none"}

Suspects or featured characters:
${formatList(
    input.suspects.map((suspect: MysteryNightWizardInput["suspects"][number]) =>
      suspect.role ? `${suspect.name} - ${suspect.role}` : suspect.name,
    ),
  )}

Locations:
${formatList(
    input.locations.map((location: MysteryNightWizardInput["locations"][number]) =>
      location.note ? `${location.name} - ${location.note}` : location.name,
    ),
  )}

Clues, objects, and story fragments:
${formatList(
    input.clues.map((clue: MysteryNightWizardInput["clues"][number]) =>
      clue.note ? `${clue.name} - ${clue.note}` : clue.name,
    ),
  )}

Rules:
- Make it feel like a stylish keepsake mystery night, not a parody of any existing detective board game.
- Use suspense, warmth, and clever callbacks.
- Keep the board printable and the copy concise.
- Use tile types like clue, twist, alibi, reveal, bonus, and challenge where appropriate.
- The game is for 2-6 players using one six-sided die and household tokens.
  `.trim();
}

export function buildInsideJokePrompt(input: InsideJokeShowdownWizardInput) {
  return `
Create a premium personalized party-style board game for the following project.

Recipient: ${input.recipientName}
Buyer: ${input.buyerName}
Occasion: ${input.occasion}
Tone: ${input.tone}
Relationship: ${input.relationship}
Visual style: ${input.visualStyle}
Color mood: ${input.colorMood}
Title override: ${input.titleOverride ?? "none"}
Subtitle override: ${input.subtitleOverride ?? "none"}
Things to avoid: ${input.avoidNotes ?? "none"}

Inside jokes and recurring bits:
${formatList(
    input.insideJokes.map((item: InsideJokeShowdownWizardInput["insideJokes"][number]) =>
      item.note ? `${item.name} - ${item.note}` : item.name,
    ),
  )}

Rapid-fire challenge prompts:
${formatList(
    input.rapidChallenges.map((item: InsideJokeShowdownWizardInput["rapidChallenges"][number]) =>
      item.note ? `${item.name} - ${item.note}` : item.name,
    ),
  )}

Catchphrases or signature lines:
${formatList(input.catchphrases)}

Rules:
- Make it feel modern, high-energy, and giftable.
- Keep everything family-friendly even if the tone is chaotic/funny.
- Use playful tiles, mini dares, and group-callout moments without copying any party-game brands.
- The game is for 2-6 players using one six-sided die and household tokens.
  `.trim();
}
