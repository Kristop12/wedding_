"use server";

import { RsvpError, submitPartyRsvp } from "@/lib/invitations/submit-rsvp";
import { fieldErrorsFromZod, rsvpSchema } from "@/lib/validation/rsvp";

export type RsvpActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitRsvpAction(
  _previous: RsvpActionState,
  formData: FormData,
): Promise<RsvpActionState> {
  const status = text(formData, "status");
  const names = formData.getAll("attendeeName");
  const meals = formData.getAll("attendeeMeal");
  const diets = formData.getAll("attendeeDietary");
  const parsed = rsvpSchema.safeParse({
    status,
    message: text(formData, "message"),
    attendees:
      status === "DECLINED"
        ? []
        : names.map((name, index) => ({
            name: typeof name === "string" ? name : "",
            mealPreference: typeof meals[index] === "string" ? meals[index] : "",
            dietaryRequirements: typeof diets[index] === "string" ? diets[index] : "",
          })),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    await submitPartyRsvp(text(formData, "token"), parsed.data);
  } catch (error) {
    if (error instanceof RsvpError) {
      return { ok: false, message: error.message };
    }
    console.error(error);
    return { ok: false, message: "Something went wrong. Try again." };
  }

  return { ok: true, message: "Your reply has been saved." };
}
