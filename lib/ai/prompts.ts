import type {
  FaceCardWizardInput,
  HomeTurfWizardInput,
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
Create an original personalized life-journey board game called "Milestone Trail".`;

export const HOME_TURF_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original personalized place-and-route strategy board game called "Home Turf".`;

export const FACE_CARD_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original personalized social deduction and people-guessing board game called "Face Card".`;

export const MYSTERY_NIGHT_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original cooperative keepsake mystery board game called "Case File".`;

export const INSIDE_JOKE_SYSTEM_PROMPT = `${COMMON_SYSTEM_RULES}
Create an original personalized trivia board game called "Trivia Trek".`;

function formatList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function formatOptionalParts(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" | ");
}

export function buildLifeQuestPrompt(input: LifeQuestWizardInput) {
  const items = input.items
    .map(
      (item: LifeQuestWizardInput["items"][number], index: number) =>
        `${index + 1}. ${item.name} [${item.category}]${
          formatOptionalParts([
            item.era ? `era: ${item.era}` : undefined,
            item.whyItMatters ? `why it matters: ${item.whyItMatters}` : undefined,
            item.note ? `small detail: ${item.note}` : undefined,
          ])
            ? ` - ${formatOptionalParts([
                item.era ? `era: ${item.era}` : undefined,
                item.whyItMatters ? `why it matters: ${item.whyItMatters}` : undefined,
                item.note ? `small detail: ${item.note}` : undefined,
              ])}`
            : ""
        }`,
    )
    .join("\n");

  return `
Create a premium personalized board-game gift concept for the following Milestone Trail project.

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
- Make the game feel like a polished life-journey keepsake with broad family appeal.
- Blend heartfelt and playful copy based on the requested tone.
- Treat the "why it matters" and era notes as the emotional spine of the game, not as throwaway metadata.
- If fewer than 32 details are provided, intelligently expand the journey with adjacent memories, recurring motifs, celebration moments, and original filler that still feels personal.
- The game is for 2-6 players using one six-sided die and household tokens.
- Include short point effects on tiles and cards.
- Keep captions concise and printable.
  `.trim();
}

export function buildHomeTurfPrompt(input: HomeTurfWizardInput) {
  return `
Create a premium personalized place-and-route board-game gift for the following Home Turf project.

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

Favorite places, routes, and local legends:
${formatList(
    input.places.map((place: HomeTurfWizardInput["places"][number]) =>
      formatOptionalParts([
        place.vibe ? `vibe: ${place.vibe}` : undefined,
        place.whyItMatters ? `why it matters: ${place.whyItMatters}` : undefined,
        place.note ? `small detail: ${place.note}` : undefined,
      ])
        ? `${place.name} - ${formatOptionalParts([
            place.vibe ? `vibe: ${place.vibe}` : undefined,
            place.whyItMatters ? `why it matters: ${place.whyItMatters}` : undefined,
            place.note ? `small detail: ${place.note}` : undefined,
          ])}`
        : place.name,
    ),
  )}

Detour Card ideas:
${formatList(
    input.dealCards.map((deal: HomeTurfWizardInput["dealCards"][number]) =>
      formatOptionalParts([
        deal.kind ? `kind: ${deal.kind}` : undefined,
        deal.prompt ? `prompt: ${deal.prompt}` : undefined,
        deal.note ? `small detail: ${deal.note}` : undefined,
      ])
        ? `${deal.name} - ${formatOptionalParts([
            deal.kind ? `kind: ${deal.kind}` : undefined,
            deal.prompt ? `prompt: ${deal.prompt}` : undefined,
            deal.note ? `small detail: ${deal.note}` : undefined,
          ])}`
        : deal.name,
    ),
  )}

Rules:
- Make it feel like a legally distinct neighborhood-map strategy keepsake, not a clone of any property-trading game.
- Do not use property color bands, square perimeter layouts, iconic corner spaces, rent tables, railroads, utilities, taxes, or any protected trade dress.
- Use favorite places, rituals, restaurants, routes, and local jokes as the emotional spine.
- Detour Cards should be obvious, playable table prompts: stories, shortcuts, votes, tiny setbacks, and small bonuses. Avoid abstract trading, rent, purchase, or property-economy mechanics.
- Use tile types like memory, reward, challenge, shortcut, rest, and wildcard.
- The game is for 2-6 players using one six-sided die, household tokens, and score markers.
- Keep text short, warm, and printable.
  `.trim();
}

export function buildFaceCardPrompt(input: FaceCardWizardInput) {
  return `
Create a premium personalized people-guessing board-game gift for the following Face Card project.

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
Reveal mode: ${input.revealMode ?? "Players ask hints, eliminate decoys, and reveal the mystery face."}

People, roles, tells, and decoys:
${formatList(
    input.people.map((person: FaceCardWizardInput["people"][number]) =>
      formatOptionalParts([
        person.role ? `role: ${person.role}` : undefined,
        person.tell ? `tell: ${person.tell}` : undefined,
        person.decoyTrait ? `decoy trait: ${person.decoyTrait}` : undefined,
      ])
        ? `${person.name} - ${formatOptionalParts([
            person.role ? `role: ${person.role}` : undefined,
            person.tell ? `tell: ${person.tell}` : undefined,
            person.decoyTrait ? `decoy trait: ${person.decoyTrait}` : undefined,
          ])}`
        : person.name,
    ),
  )}

Hint categories and prompt ideas:
${formatList(
    input.cluePrompts.map((clue: FaceCardWizardInput["cluePrompts"][number]) =>
      formatOptionalParts([
        clue.difficulty ? `difficulty: ${clue.difficulty}` : undefined,
        clue.prompt ? `prompt: ${clue.prompt}` : undefined,
        clue.note ? `answer anchor: ${clue.note}` : undefined,
      ])
        ? `${clue.name} - ${formatOptionalParts([
            clue.difficulty ? `difficulty: ${clue.difficulty}` : undefined,
            clue.prompt ? `prompt: ${clue.prompt}` : undefined,
            clue.note ? `answer anchor: ${clue.note}` : undefined,
          ])}`
        : clue.name,
    ),
  )}

Rules:
- Make it feel like an original social guessing keepsake, not a clone of any character-flipping game.
- Do not use flip-up racks, copied face-card grids, protected character-board layouts, or brand-specific visual cues.
- Use the people's habits, tells, roles, pets, catchphrases, and decoys heavily.
- Use tile types like clue, challenge, bonus, twist, reveal, and wildcard, but call the customer-facing deck "Hint Cards".
- The game is for 2-6 players using one six-sided die, household tokens, and score markers.
- Keep copy playful, kind, and printable.
  `.trim();
}

export function buildMysteryNightPrompt(input: MysteryNightWizardInput) {
  return `
Create a premium personalized mystery deduction board game for the following Case File project.

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
      formatOptionalParts([
        suspect.role ? `role: ${suspect.role}` : undefined,
        suspect.trait ? `trait: ${suspect.trait}` : undefined,
        suspect.suspicionLevel ? `${suspect.suspicionLevel} suspicion` : undefined,
      ])
        ? `${suspect.name} - ${formatOptionalParts([
            suspect.role ? `role: ${suspect.role}` : undefined,
            suspect.trait ? `trait: ${suspect.trait}` : undefined,
            suspect.suspicionLevel ? `${suspect.suspicionLevel} suspicion` : undefined,
          ])}`
        : suspect.name,
    ),
  )}

Locations:
${formatList(
    input.locations.map((location: MysteryNightWizardInput["locations"][number]) =>
      formatOptionalParts([
        location.mood ? `mood: ${location.mood}` : undefined,
        location.whyItMatters ? `why it matters: ${location.whyItMatters}` : undefined,
        location.note ? `small detail: ${location.note}` : undefined,
      ])
        ? `${location.name} - ${formatOptionalParts([
            location.mood ? `mood: ${location.mood}` : undefined,
            location.whyItMatters ? `why it matters: ${location.whyItMatters}` : undefined,
            location.note ? `small detail: ${location.note}` : undefined,
          ])}`
        : location.name,
    ),
  )}

Clues, objects, and story fragments:
${formatList(
    input.clues.map((clue: MysteryNightWizardInput["clues"][number]) =>
      formatOptionalParts([
        clue.story ? `story: ${clue.story}` : undefined,
        clue.note ? `extra detail: ${clue.note}` : undefined,
      ])
        ? `${clue.name} - ${formatOptionalParts([
            clue.story ? `story: ${clue.story}` : undefined,
            clue.note ? `extra detail: ${clue.note}` : undefined,
          ])}`
        : clue.name,
    ),
  )}

Rules:
- Make it feel like a stylish keepsake mystery case, not a parody of any existing detective board game.
- Use suspense, warmth, and clever callbacks.
- Let the cast traits, scene moods, and clue stories meaningfully shape the mystery logic.
- Keep the board printable and the copy concise.
- Use tile types like clue, twist, alibi, reveal, bonus, and challenge where appropriate.
- The game is for 2-6 players using one six-sided die and household tokens.
  `.trim();
}

export function buildInsideJokePrompt(input: InsideJokeShowdownWizardInput) {
  return `
Create a premium personalized trivia board game for the following Trivia Trek project.

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

Question topics and recurring stories:
${formatList(
    input.insideJokes.map((item: InsideJokeShowdownWizardInput["insideJokes"][number]) =>
      formatOptionalParts([
        item.whyItMatters ? `why it matters: ${item.whyItMatters}` : undefined,
        item.factOne ? `fact 1: ${item.factOne}` : undefined,
        item.factTwo ? `fact 2: ${item.factTwo}` : undefined,
        item.factThree ? `fact 3: ${item.factThree}` : undefined,
        item.note ? `answer anchor: ${item.note}` : undefined,
      ])
        ? `${item.name} - ${formatOptionalParts([
            item.whyItMatters ? `why it matters: ${item.whyItMatters}` : undefined,
            item.factOne ? `fact 1: ${item.factOne}` : undefined,
            item.factTwo ? `fact 2: ${item.factTwo}` : undefined,
            item.factThree ? `fact 3: ${item.factThree}` : undefined,
            item.note ? `answer anchor: ${item.note}` : undefined,
          ])}`
        : item.name,
    ),
  )}

Bonus prompts and tie-breakers:
${formatList(
    input.rapidChallenges.map((item: InsideJokeShowdownWizardInput["rapidChallenges"][number]) =>
      formatOptionalParts([
        item.prompt ? `prompt: ${item.prompt}` : undefined,
        item.difficulty ? `difficulty: ${item.difficulty}` : undefined,
        item.note ? `answer anchor: ${item.note}` : undefined,
      ])
        ? `${item.name} - ${formatOptionalParts([
            item.prompt ? `prompt: ${item.prompt}` : undefined,
            item.difficulty ? `difficulty: ${item.difficulty}` : undefined,
            item.note ? `answer anchor: ${item.note}` : undefined,
          ])}`
        : item.name,
    ),
  )}

Signature answers, quotes, or repeated references:
${formatList(input.catchphrases)}

Rules:
- Make it feel polished, social, and giftable like a premium trivia-night keepsake.
- Keep everything family-friendly even if the tone is chaotic/funny.
- Use trivia prompts, bonus rounds, and callback answers without copying any quiz-game brands.
- Build strong personalized trivia from the category facts and answer anchors instead of generic questions.
- The game is for 2-6 players using one six-sided die and household tokens.
  `.trim();
}
