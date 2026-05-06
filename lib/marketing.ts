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
    eyebrow: "For hometown gifts and favorite-place stories",
    idealFor: ["Housewarmings", "Couples", "Families", "Friend groups"],
    personalize: [
      "Homes, restaurants, trips, rituals, local legends, and favorite routes",
      "A neighborhood-map board with local legend and detour decks",
      "The tone, map style, color mood, title, and delivery tier",
    ],
    emotionalPromise:
      "Feels like their personal map turned into a replayable strategy gift.",
    leadLine:
      "A place-collecting keepsake built from meaningful spots, local lore, story prompts, and shortcuts.",
  },
  "milestone-trail": {
    eyebrow: "For milestone gifts and heartfelt stories",
    idealFor: ["Anniversaries", "Birthdays", "Retirement", "Family milestones"],
    personalize: [
      "Life chapters, places, habits, milestones, and favorite people",
      "A winding journey board with keepsake card decks",
      "Title, subtitle, tone, and visual direction",
    ],
    emotionalPromise:
      "Feels like a warm, replayable tribute rather than a novelty gift.",
    leadLine:
      "A premium journey board that turns a life story into something the whole table can replay.",
  },
  "face-card": {
    eyebrow: "For families, teams, and friend groups",
    idealFor: ["Reunions", "Teams", "Friend groups", "Family game night"],
    personalize: [
      "People, pets, roles, habits, tells, decoys, and catchphrases",
      "A social guessing board with hint and reveal decks",
      "Reveal style, visual mood, and delivery format",
    ],
    emotionalPromise:
      "Feels instantly familiar because the cast is literally your people.",
    leadLine:
      "A playful people-guessing game built from familiar faces, tells, decoys, and group lore.",
  },
  "case-file": {
    eyebrow: "For group gifts and story-forward surprises",
    idealFor: ["Friend groups", "Family reunions", "Date nights", "Birthdays"],
    personalize: [
      "Suspects, scenes, clues, and the final twist",
      "A deduction-style board with evidence and twist decks",
      "The mood of the case, from cozy to dramatic",
    ],
    emotionalPromise:
      "Feels clever, theatrical, and deeply specific to the people in the room.",
    leadLine:
      "A mystery keepsake built from familiar faces, suspicious details, and group lore.",
  },
  "trivia-trek": {
    eyebrow: "For lively groups, couples, and family game night",
    idealFor: ["Reunions", "Couples", "Family nights", "Friend-group gifts"],
    personalize: [
      "Question categories, answer anchors, stories, and signature lines",
      "A trivia board with question and bonus-round decks",
      "Difficulty, style, and the energy of the night",
    ],
    emotionalPromise:
      "Feels social, fast, and unmistakably built for your inside references.",
    leadLine:
      "A polished trivia-night keepsake made from the stories and answers only your people would know.",
  },
};

export function getTemplateMarketing(slug: TemplateSlug) {
  return TEMPLATE_MARKETING[slug];
}
