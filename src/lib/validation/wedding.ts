import { z } from "zod";
import { WEDDING_THEMES } from "@/lib/weddings/constants";
import { isValidTimeZone } from "@/lib/weddings/datetime";
import { isWeddingSlug } from "@/lib/weddings/slug";
import { BODY_FONTS, ENVELOPE_STYLES, HEADING_FONTS, SCRIPT_FONTS } from "@/themes/options";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const optionalEmail = z
  .string()
  .trim()
  .max(191)
  .optional()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || z.email().safeParse(value).success, {
    message: "Enter a valid email.",
  });

export const coupleSchema = z.object({
  partnerOneName: z.string().trim().min(1, "Enter the first partner's name.").max(120),
  partnerTwoName: z.string().trim().min(1, "Enter the second partner's name.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Choose a wedding link.")
    .max(80)
    .refine(isWeddingSlug, {
      message: "Use lowercase letters, numbers, and hyphens.",
    }),
});

export const weddingDetailsSchema = z.object({
  weddingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a wedding date.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  timezone: z.string().trim().refine(isValidTimeZone, "Choose a valid timezone."),
  location: optionalText(255),
  description: optionalText(2000),
});

export const themeSchema = z.object({
  themeId: z.enum(WEDDING_THEMES.map((theme) => theme.id) as [string, ...string[]]),
});

export const themeSettingsSchema = z.object({
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a primary color."),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose an accent color."),
  headingFont: z.enum(HEADING_FONTS),
  bodyFont: z.enum(BODY_FONTS),
  scriptFont: z.enum(SCRIPT_FONTS),
  envelopeStyle: z.enum(ENVELOPE_STYLES.map((style) => style.id) as [string, ...string[]]),
  sealInitials: z
    .string()
    .trim()
    .min(1, "Add initials for the wax seal.")
    .max(8)
    .regex(/^[A-Za-z0-9& ]+$/, "Use letters, numbers, or &."),
  musicEnabled: z.boolean(),
  musicUrl: z
    .string()
    .trim()
    .max(500)
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || isAudioUrl(value), {
      message: "Use an https link to an mp3 or m4a file.",
    }),
});

function isAudioUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /\.(mp3|m4a)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const eventSchema = z
  .object({
    eventId: z.string().trim().optional().transform((value) => value || null),
    name: z.string().trim().min(1, "Enter an event name.").max(120),
    description: optionalText(2000),
    startAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a start date and time."),
    endAt: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || null)
      .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), {
        message: "Choose a valid end date and time.",
      }),
    venueName: optionalText(160),
    address: optionalText(255),
    mapUrl: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((value) => (value ? value : null))
      .refine((value) => value === null || z.url().safeParse(value).success, {
        message: "Enter a valid map link.",
      }),
    dressCode: optionalText(120),
  })
  .superRefine((value, ctx) => {
    if (value.endAt && value.endAt < value.startAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "The end time must be after the start time.",
      });
    }
  });

const guestMemberSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name.").max(80),
  lastName: z.string().trim().min(1, "Enter a last name.").max(80),
  email: optionalEmail,
  phone: optionalText(40),
});

export const guestPartySchema = z
  .object({
    name: z.string().trim().min(1, "Enter a party name.").max(160),
    maxGuests: z.coerce.number().int().min(1).max(20),
    groupId: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || null),
    newGroupName: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => value || null),
    members: z.array(guestMemberSchema).min(1, "Add at least one guest.").max(20),
  })
  .superRefine((value, ctx) => {
    if (value.members.length > value.maxGuests) {
      ctx.addIssue({
        code: "custom",
        path: ["maxGuests"],
        message: "The guest list is longer than the allowed seats.",
      });
    }
  });

export type ThemeSettingsInput = z.infer<typeof themeSettingsSchema>;
export type CoupleInput = z.infer<typeof coupleSchema>;
export type WeddingDetailsInput = z.infer<typeof weddingDetailsSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type GuestPartyInput = z.infer<typeof guestPartySchema>;

export const guestGroupSchema = z.object({
  name: z.string().trim().min(1, "Enter a group name.").max(120),
});

export type GuestGroupInput = z.infer<typeof guestGroupSchema>;

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine(isImageUrl, "Use a site path or an https image link.");

export const storyItemSchema = z.object({
  storyId: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  date: optionalText(40),
  description: optionalText(2000),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || isImageUrl(value), {
      message: "Use a site path or an https image link.",
    }),
});

export const galleryItemSchema = z.object({
  galleryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  imageUrl,
  caption: optionalText(255),
});

export const faqItemSchema = z.object({
  faqId: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  question: z.string().trim().min(1, "Enter a question.").max(200),
  answer: z.string().trim().min(1, "Enter an answer.").max(4000),
});

export type StoryItemInput = z.infer<typeof storyItemSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type FaqItemInput = z.infer<typeof faqItemSchema>;

export type FieldErrors = Record<string, string>;

export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}
