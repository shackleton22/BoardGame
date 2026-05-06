import type { TemplateSlug } from "@/lib/templates/types";
import type { ProjectOutputPayload } from "@/lib/validation/project";

function compactList(values: string[], maxItems: number, maxLength = 320) {
  return values
    .filter(Boolean)
    .slice(0, maxItems)
    .join(", ")
    .slice(0, maxLength);
}

function compactInputSignals(inputJson: unknown) {
  if (!inputJson || typeof inputJson !== "object") {
    return "";
  }

  const input = inputJson as Record<string, unknown>;
  const signals: string[] = [];

  for (const key of [
    "places",
    "dealCards",
    "items",
    "people",
    "cluePrompts",
    "suspects",
    "locations",
    "clues",
    "insideJokes",
    "rapidChallenges",
    "catchphrases",
  ]) {
    const value = input[key];

    if (Array.isArray(value)) {
      signals.push(`${key}: ${JSON.stringify(value).slice(0, 700)}`);
    }
  }

  return signals.join("\n").slice(0, 2400);
}

function inputArray(inputJson: unknown, key: string) {
  if (!inputJson || typeof inputJson !== "object") {
    return [];
  }

  const value = (inputJson as Record<string, unknown>)[key];
  return Array.isArray(value) ? value : [];
}

function fieldList(items: unknown[], fields: string[], maxItems: number) {
  return items
    .slice(0, maxItems)
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      const record = item as Record<string, unknown>;
      return fields
        .map((field) => record[field])
        .filter((value) => typeof value === "string" && value.trim().length > 0)
        .join(" | ");
    })
    .filter(Boolean)
    .join("; ");
}

function getPersonalizationArtMandate(slug: TemplateSlug, inputJson: unknown) {
  switch (slug) {
    case "home-turf": {
      const places = fieldList(inputArray(inputJson, "places"), ["name", "vibe", "whyItMatters"], 8);
      const cards = fieldList(inputArray(inputJson, "dealCards"), ["name", "prompt"], 5);
      return [
        "This must feel like a personal local map, not generic global travel.",
        places ? `Visually echo these exact places through illustrations, props, and tile scenes: ${places}.` : "",
        cards ? `Show small game-component cues for these action-card ideas without readable text: ${cards}.` : "",
        "Favor home streets, restaurants, lake weekends, dog-walk loops, bookstores, fire pits, porches, and neighborhood details over passports, generic world maps, luxury travel props, or random instruments.",
      ].join(" ");
    }
    case "case-file": {
      const suspects = fieldList(inputArray(inputJson, "suspects"), ["name", "role", "trait"], 6);
      const locations = fieldList(inputArray(inputJson, "locations"), ["name", "mood", "whyItMatters"], 6);
      const clues = fieldList(inputArray(inputJson, "clues"), ["name", "story"], 8);
      return [
        "Make this legally distinct from classic mansion murder-mystery trade dress.",
        "Do not use a mansion-floorplan murder board, weapon row, revolver, rope, dagger, wrench, candlestick, billiard-room/library-style lineup, or dark lethal-crime tone.",
        "Instead create a funny friendship investigation game: evidence wall, case board, map pins, photo booth strips, cafe table, cabin kitchen, receipt scraps, playlist cards, calendar notes, snack clues, coffee cups, camera-roll/photo evidence, and suspect profile panels.",
        suspects ? `Suspect profile panels should visually suggest: ${suspects}.` : "",
        locations ? `Scene areas should visually suggest: ${locations}.` : "",
        clues ? `Evidence props should visually suggest: ${clues}.` : "",
      ].join(" ");
    }
    case "face-card": {
      const people = fieldList(inputArray(inputJson, "people"), ["name", "role", "tell", "decoyTrait"], 10);
      const prompts = fieldList(inputArray(inputJson, "cluePrompts"), ["name", "prompt"], 5);
      return [
        "The portrait grid must feel like this specific family/friend cast, not random headshots.",
        people ? `Visually suggest these people through outfits, props, poses, and background icons: ${people}.` : "",
        prompts ? `Show clue-card and marker areas that imply these clue themes without readable text: ${prompts}.` : "",
        "Include reunion/party details like dessert table, grill tools, camera/phone photos, grandparent story cues, dog snack-inspector motifs, playlist/karaoke props, and colorful markers.",
      ].join(" ");
    }
    case "trivia-trek": {
      const jokes = fieldList(
        inputArray(inputJson, "insideJokes"),
        ["name", "whyItMatters", "factOne", "factTwo", "factThree"],
        8,
      );
      const challenges = fieldList(inputArray(inputJson, "rapidChallenges"), ["name", "prompt"], 6);
      const catchphrases = fieldList(inputArray(inputJson, "catchphrases"), [], 6);
      return [
        "The trivia wheel must feel like a custom group-lore birthday game, not generic category wedges.",
        jokes ? `Visually echo these category stories with icons and mini-scenes: ${jokes}.` : "",
        challenges ? `Show bonus/speed-round components inspired by: ${challenges}.` : "",
        catchphrases ? `Suggest the energy of these catchphrases without rendering readable text: ${catchphrases}.` : "",
        "Use road-trip snacks, cooler/sunglasses, brunch table, pet chaos, karaoke microphone/stage lights, birthday group-game energy, score tokens, and prompt-card stacks.",
      ].join(" ");
    }
    case "milestone-trail":
    default: {
      const items = fieldList(inputArray(inputJson, "items"), ["name", "era", "whyItMatters"], 10);
      return [
        "The journey board must feel like a specific keepsake relationship/life story, not generic adventure art.",
        items ? `Visually echo these milestone scenes and props: ${items}.` : "",
        "Include cozy home rituals, rainy proposal/walk cues, pancakes or breakfast table, mountain trip/photo overlook, career toast, movie blanket, postcards, keepsake photos, and warm anniversary details where compatible.",
      ].join(" ");
    }
  }
}

function getTemplateArtDirection(slug: TemplateSlug) {
  switch (slug) {
    case "home-turf":
      return [
        "A premium top-down square personalized place-strategy board game.",
        "Use a complete legally distinct place-collection board with a connected route, richly illustrated local-place tiles, a central neighborhood collage, game-card zones, score/token areas, and customer-proof polish.",
        "Leave clean rectangular zones for deterministic labels on tile headers and the center title plaque.",
      ].join(" ");
    case "case-file":
      return [
        "A premium top-down square cooperative investigation board game with a central evidence wall, scene map, case timeline, clue-card decks, suspect profile panels, theory tracker, and playful friendship-mystery components.",
        "Use warm paper textures, corkboard, photos, string lines, cafe/cabin/photo-booth/snack evidence motifs, and tabletop shadows rather than a mansion floor plan.",
        "Leave blank title plaques, scene labels, suspect labels, clue labels, and theory tracker fields for deterministic text overlay.",
      ].join(" ");
    case "face-card":
      return [
        "A premium people-guessing board game with a grid of illustrated portrait-card frames.",
        "Include polished character-card slots, colorful category panels, clue-card decks, score markers, and a clean tabletop product composition.",
        "Leave all character names, clues, and card labels blank for deterministic text overlay.",
      ].join(" ");
    case "trivia-trek":
      return [
        "A premium circular trivia board game with a radial category wheel, outer scoring path, prompt-card decks, score markers, and lively tabletop presentation.",
        "Make it colorful, polished, and retail-ready, with blank category wedges and blank prompt cards for deterministic text overlay.",
      ].join(" ");
    case "milestone-trail":
    default:
      return [
        "A premium top-down square life-journey board game with a winding path across scrapbook scenes.",
        "Include illustrated milestones, travel moments, home scenes, memory-card decks, spinner/marker details, postcards, photos, maps, warm lighting, and elegant keepsake textures.",
        "Leave clear blank spaces for deterministic tile labels, title, subtitle, and card text overlay.",
      ].join(" ");
  }
}

export function buildBoardArtworkPrompt(args: {
  templateSlug: TemplateSlug;
  recipientName: string;
  occasion: string;
  output: ProjectOutputPayload;
  basePrompt?: string;
  inputJson?: unknown;
  revisionPrompt?: string;
}) {
  const tileNames = compactList(
    args.output.tiles.map((tile) => tile.name),
    18,
  );
  const cardNames = compactList(
    [...args.output.deckPrimary, ...args.output.deckSecondary].map((card) => card.title),
    12,
  );
  const inputSignals = compactInputSignals(args.inputJson);
  const personalizationMandate = getPersonalizationArtMandate(
    args.templateSlug,
    args.inputJson,
  );

  return [
    "Create a single finished square board-game image that looks like a premium retail tabletop product photographed/rendered from directly overhead.",
    getTemplateArtDirection(args.templateSlug),
    `Personalization theme: recipient ${args.recipientName}, occasion ${args.occasion}.`,
    `Game title direction: ${args.output.title}. Subtitle direction: ${args.output.subtitle}.`,
    `Important personal content to visually suggest without rendering readable text: ${tileNames}.`,
    `Card/deck themes to visually suggest without readable text: ${cardNames}.`,
    `Personalization mandate: ${personalizationMandate}`,
    inputSignals ? `Original wizard inputs to visually respect:\n${inputSignals}` : "",
    args.basePrompt ? `Additional style prompt: ${args.basePrompt}.` : "",
    args.revisionPrompt ? `Revision instructions from QA reviewers:\n${args.revisionPrompt}` : "",
    "Quality bar: high-end board game product art, rich texture, realistic shadows, crisp details, premium packaging-adjacent visual polish, not a flat diagram, not a wireframe, not a simple SVG illustration.",
    "Critical text rule: do not render readable words, numbers, logos, trademarks, brand names, mascots, or any protected game names. Any labels should be blank plaques, abstract marks, or illegible texture only because the app overlays real SVG/PDF text afterward.",
    "IP safety rule: do not copy exact protected board-game trade dress, corner-square iconography, mascot characters, official layouts, logos, card names, or distinctive brand elements. Make the board legally distinct while still feeling like a classic tabletop game category.",
    "Composition: square 1:1 board, centered, full board visible, no hands, no people, no cropped edges, no watermark.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildTemplateShowcasePrompt(args: {
  templateSlug: TemplateSlug;
  templateName: string;
  recipientName: string;
  occasion: string;
  output: ProjectOutputPayload;
  inputJson?: unknown;
  revisionPrompt?: string;
}) {
  return buildBoardArtworkPrompt({
    templateSlug: args.templateSlug,
    recipientName: args.recipientName,
    occasion: args.occasion,
    output: args.output,
    inputJson: args.inputJson,
    revisionPrompt: args.revisionPrompt,
    basePrompt: [
      `This is a sample marketing proof for the ${args.templateName} template.`,
      "It should look like the exact board a customer is buying, with blank spaces where the app will overlay final customer-visible text.",
      "Make the image dramatically more polished than a generated diagram: detailed art direction, product-grade lighting, layered tabletop materials, and realistic print texture.",
    ].join(" "),
  });
}
