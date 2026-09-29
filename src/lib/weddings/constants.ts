export const ACTIVE_WEDDING_COOKIE = "wedding_id";

export const DEFAULT_TIMEZONE = "Asia/Manila";

export const TIMEZONES = [
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Europe/London",
  "Europe/Paris",
  "America/Los_Angeles",
  "America/Chicago",
  "America/New_York",
  "UTC",
] as const;

export const DEFAULT_GUEST_GROUPS = [
  "Bride Family",
  "Groom Family",
  "Friends",
  "Work",
  "VIP",
  "Principal Sponsors",
  "Entourage",
] as const;

export const SECTION_LABELS = {
  HERO: "Hero",
  COUNTDOWN: "Countdown",
  STORY: "Our Story",
  EVENTS: "Events",
  ENTOURAGE: "Entourage",
  DRESS_CODE: "Dress Code",
  GALLERY: "Gallery",
  RSVP: "RSVP",
  GIFTS: "Gifts",
  FAQ: "FAQ",
} as const;

export const SECTION_ORDER = [
  "HERO",
  "COUNTDOWN",
  "STORY",
  "EVENTS",
  "ENTOURAGE",
  "DRESS_CODE",
  "GALLERY",
  "RSVP",
  "GIFTS",
  "FAQ",
] as const;

export const WIZARD_STEPS = [
  { id: "couple", label: "Couple" },
  { id: "wedding", label: "Wedding" },
  { id: "theme", label: "Theme" },
  { id: "events", label: "Events" },
  { id: "guests", label: "Guests" },
  { id: "publish", label: "Publish" },
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number]["id"];

export function isWizardStep(value: string | undefined): value is WizardStep {
  return WIZARD_STEPS.some((step) => step.id === value);
}

export const WEDDING_THEMES = [
  {
    id: "rustic",
    name: "Rustic",
    description: "Warm cream paper, terracotta, sage, and a kraft envelope.",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Ivory card, gold monogram, and a slow reveal.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "A split panel that slides open into a clean card.",
  },
  {
    id: "tropical",
    name: "Tropical",
    description: "Leaves part to reveal a rounded garden card.",
  },
] as const;

export type WeddingThemeId = (typeof WEDDING_THEMES)[number]["id"];
