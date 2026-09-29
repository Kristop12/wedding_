import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const attendeeSchema = z.object({
  name: z.string().trim().min(1, "Enter a guest name.").max(160),
  mealPreference: optionalText(80),
  dietaryRequirements: optionalText(2000),
});

export const rsvpSchema = z
  .object({
    status: z.enum(["ACCEPTED", "DECLINED"], { error: "Choose a response." }),
    message: optionalText(2000),
    attendees: z.array(attendeeSchema).max(20),
  })
  .superRefine((value, ctx) => {
    if (value.status === "ACCEPTED" && value.attendees.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees"],
        message: "Add at least one guest.",
      });
    }
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;

export function fieldErrorsFromZod(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}
