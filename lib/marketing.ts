import type { TemplateSlug } from "@/lib/templates/types";

export type TemplateMarketingProfile = {
  eyebrow: string;
  idealFor: string[];
  personalize: string[];
  emotionalPromise: string;
  leadLine: string;
};

export const TEMPLATE_MARKETING: Record<TemplateSlug, TemplateMarketingProfile> = {
  "home-turf": {
    eyebrow: "For favorite places and local legends",
    idealFor: ["Housewarmings", "Couples", "Families", "Friend groups"],
    personalize: [
      "Homes, restaurants, trips, rituals, local legends, and favorite routes",
      "A neighborhood-map board with local legend and detour decks",
      "The tone, map style, color mood, title, and delivery tier",
    ],
    emotionalPromise:
      "Feels like their personal map turned into a replayable strategy gift.",
    leadLine:
      "Turn first apartments, favorite restaurants, road trips, and neighborhood lore into a board they can play.",
  },
  "milestone-trail": {
    eyebrow: "For birthdays, anniversaries, and big chapters",
    idealFor: ["Anniversaries", "Birthdays", "Retirement", "Family milestones"],
    personalize: [
      "Life chapters, places, habits, milestones, and favorite people",
      "A winding journey board with keepsake card decks",
      "Title, subtitle, tone, and visual direction",
    ],
    emotionalPromise:
      "Feels like a warm, replayable tribute rather than a novelty gift.",
    leadLine:
      "Build a warm journey game from the places, wins, habits, and memories that shaped someone's life.",
  },
  "face-card": {
    eyebrow: "For groups where everyone has a tell",
    idealFor: ["Reunions", "Teams", "Friend groups", "Family game night"],
    personalize: [
      "People, pets, roles, habits, tells, decoys, and catchphrases",
      "A social guessing board with hint and reveal decks",
      "Reveal style, visual mood, and delivery format",
    ],
    emotionalPromise:
      "Feels instantly familiar because the cast is literally your people.",
    leadLine:
      "Create a social guessing game from your real cast: habits, catchphrases, tells, decoys, and pets included.",
  },
  "case-file": {
    eyebrow: "For mystery lovers and dramatic groups",
    idealFor: ["Friend groups", "Family reunions", "Date nights", "Birthdays"],
    personalize: [
      "Suspects, scenes, clues, and the final twist",
      "A deduction-style board with evidence and twist decks",
      "The mood of the case, from cozy to dramatic",
    ],
    emotionalPromise:
      "Feels clever, theatrical, and deeply specific to the people in the room.",
    leadLine:
      "Cast your friends or family as suspects, scenes, clues, and twists in a mystery made just for them.",
  },
  "trivia-trek": {
    eyebrow: "For inside jokes, lore, and friendly arguments",
    idealFor: ["Reunions", "Couples", "Family nights", "Friend-group gifts"],
    personalize: [
      "Question categories, answer anchors, stories, and signature lines",
      "A trivia board with question and bonus-round decks",
      "Difficulty, style, and the energy of the night",
    ],
    emotionalPromise:
      "Feels social, fast, and unmistakably built for your inside references.",
    leadLine:
      "Make a trivia game from the stories, categories, quotes, and answers only your people would know.",
  },
};

export function getTemplateMarketing(slug: TemplateSlug) {
  return TEMPLATE_MARKETING[slug];
}
