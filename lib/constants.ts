export const APP_NAME = "GameGift Studio";
export const DEFAULT_SUPPORT_EMAIL = "support@gamegiftstudio.com";

export const OCCASION_OPTIONS = [
  "birthday",
  "wedding",
  "anniversary",
  "holiday",
  "graduation",
  "retirement",
  "friendship",
  "family reunion",
  "other",
] as const;

export const TONE_OPTIONS = [
  "heartfelt",
  "funny",
  "elegant",
  "adventurous",
  "family-friendly",
  "chaotic/funny",
] as const;

export const RELATIONSHIP_OPTIONS = [
  "partner",
  "spouse",
  "parent",
  "child",
  "friend",
  "sibling",
  "coworker",
  "family",
  "group",
] as const;

export const VISUAL_STYLE_OPTIONS = [
  "modern",
  "vintage",
  "cozy",
  "adventure map",
  "luxury",
  "playful",
  "rustic",
] as const;

export const COLOR_MOOD_OPTIONS = [
  "warm",
  "bright",
  "muted",
  "bold",
  "neutral",
] as const;

export const ITEM_CATEGORY_OPTIONS = [
  "place",
  "hobby",
  "memory",
  "person_pet",
  "achievement",
  "inside_joke",
  "travel",
  "food",
  "career",
  "other",
] as const;

export const LIFE_QUEST_PLACEHOLDERS = [
  "Lake house weekends",
  "Nashville trip",
  "Grandma's kitchen",
  "Home gym",
  "First apartment",
  "Sourdough era",
  "Sunday movie marathons",
  "The karaoke phase",
] as const;

export const LIFE_QUEST_ERA_OPTIONS = [
  "childhood",
  "teen years",
  "young adult years",
  "recent years",
  "timeless",
] as const;

export const MYSTERY_NIGHT_SUSPECT_PLACEHOLDERS = [
  "The snack thief",
  "The trivia champion",
  "The last-minute planner",
  "The always-late legend",
] as const;

export const MYSTERY_NIGHT_LOCATION_PLACEHOLDERS = [
  "The lake cabin",
  "The favorite diner booth",
  "The overpacked road trip car",
  "The office break room",
] as const;

export const MYSTERY_NIGHT_CLUE_PLACEHOLDERS = [
  "A glittery receipt",
  "A half-finished playlist",
  "A suspicious coffee order",
  "A photo booth strip",
  "A scribbled to-do list",
  "A mystery keychain",
] as const;

export const MYSTERY_SUSPICION_OPTIONS = ["low", "medium", "high"] as const;

export const MYSTERY_LOCATION_MOOD_OPTIONS = [
  "cozy",
  "dramatic",
  "chaotic",
  "nostalgic",
  "glamorous",
] as const;

export const INSIDE_JOKE_PLACEHOLDERS = [
  "Family vacations",
  "First apartment lore",
  "Favorite restaurants",
  "Holiday disasters",
  "Pet chaos",
  "Career milestones",
] as const;

export const INSIDE_JOKE_CHALLENGE_PLACEHOLDERS = [
  "Ask a tie-breaker",
  "Finish the quote",
  "Name who started it",
  "Guess the year",
] as const;

export const TRIVIA_DIFFICULTY_OPTIONS = ["easy", "medium", "hard"] as const;

export const PROTECTED_REFERENCE_TERMS = [
  "monopoly",
  "clue",
  "guess who",
  "hasbro",
  "scrabble",
  "risk",
  "catan",
  "sorry",
  "the game of life",
  "trivial pursuit",
  "pictionary",
  "scattergories",
  "taboo",
  "uno",
] as const;
