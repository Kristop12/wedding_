"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AccessError } from "@/lib/errors";
import {
  coupleSchema,
  eventSchema,
  fieldErrorsFromZod,
  guestGroupSchema,
  guestPartySchema,
  storyItemSchema,
  galleryItemSchema,
  faqItemSchema,
  themeSchema,
  themeSettingsSchema,
  weddingDetailsSchema,
} from "@/lib/validation/wedding";
import { ACTIVE_WEDDING_COOKIE } from "@/lib/weddings/constants";
import {
  createGuestGroup,
  createGuestParty,
  createWedding,
  deleteEvent,
  deleteGuestGroup,
  deleteGuestParty,
  deleteFaqItem,
  deleteGalleryItem,
  deleteStoryItem,
  importGuestCsv,
  markInvitationSent,
  moveFaqItem,
  moveGalleryItem,
  moveSection,
  moveStoryItem,
  publishWedding,
  saveEvent,
  saveFaqItem,
  saveGalleryItem,
  saveStoryItem,
  setSectionEnabled,
  unpublishWedding,
  updateCouple,
  updateGuestParty,
  updateTheme,
  updateThemeSettings,
  updateWeddingDetails,
  WeddingActionError,
} from "@/lib/weddings/service";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

async function currentUserId() {
  const session = await getSession();
  if (!session) {
    throw new AccessError("UNAUTHORIZED");
  }
  return session.user.id;
}

function failure(error: unknown): ActionState {
  if (error instanceof AccessError) {
    return {
      ok: false,
      message:
        error.code === "UNAUTHORIZED"
          ? "Sign in to continue."
          : "You do not have permission to do that.",
    };
  }
  if (error instanceof WeddingActionError) {
    return { ok: false, message: error.message };
  }
  console.error(error);
  return { ok: false, message: "Something went wrong. Try again." };
}

async function rememberWedding(weddingId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WEDDING_COOKIE, weddingId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

function nextPath(formData: FormData) {
  const next = formData.get("next");
  if (typeof next !== "string" || !next.startsWith("/dashboard/") || next.startsWith("//")) {
    return null;
  }
  return next;
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createWeddingAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = coupleSchema.safeParse({
    partnerOneName: text(formData, "partnerOneName"),
    partnerTwoName: text(formData, "partnerTwoName"),
    slug: text(formData, "slug"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the form and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  let weddingId = "";
  try {
    const wedding = await createWedding(await currentUserId(), parsed.data);
    weddingId = wedding.id;
    await rememberWedding(wedding.id);
  } catch (error) {
    return failure(error);
  }

  redirect(`/dashboard/weddings/${weddingId}/setup?step=wedding`);
}

export async function updateCoupleAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = coupleSchema.safeParse({
    partnerOneName: text(formData, "partnerOneName"),
    partnerTwoName: text(formData, "partnerTwoName"),
    slug: text(formData, "slug"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the form and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await updateCouple(await currentUserId(), weddingId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  const next = nextPath(formData);
  if (next) {
    redirect(next);
  }
  return { ok: true, message: "Couple details saved." };
}

export async function updateDetailsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = weddingDetailsSchema.safeParse({
    weddingDate: text(formData, "weddingDate"),
    timezone: text(formData, "timezone"),
    location: text(formData, "location"),
    description: text(formData, "description"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the form and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await updateWeddingDetails(await currentUserId(), weddingId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  const next = nextPath(formData);
  if (next) {
    redirect(next);
  }
  return { ok: true, message: "Wedding details saved." };
}

export async function updateThemeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = themeSchema.safeParse({ themeId: text(formData, "themeId") });
  if (!parsed.success) {
    return { ok: false, message: "Choose a theme.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    await updateTheme(await currentUserId(), weddingId, parsed.data.themeId);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  const next = nextPath(formData);
  if (next) {
    redirect(next);
  }
  return { ok: true, message: "Theme saved." };
}

export async function updateThemeSettingsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = themeSettingsSchema.safeParse({
    primaryColor: text(formData, "primaryColor"),
    accentColor: text(formData, "accentColor"),
    headingFont: text(formData, "headingFont"),
    bodyFont: text(formData, "bodyFont"),
    scriptFont: text(formData, "scriptFont"),
    envelopeStyle: text(formData, "envelopeStyle"),
    sealInitials: text(formData, "sealInitials"),
    musicEnabled: formData.get("musicEnabled") === "on",
    musicUrl: text(formData, "musicUrl"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the theme settings and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await updateThemeSettings(await currentUserId(), weddingId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  return { ok: true, message: "Theme settings saved." };
}

export async function saveEventAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = eventSchema.safeParse({
    eventId: text(formData, "eventId"),
    name: text(formData, "name"),
    description: text(formData, "description"),
    startAt: text(formData, "startAt"),
    endAt: text(formData, "endAt"),
    venueName: text(formData, "venueName"),
    address: text(formData, "address"),
    mapUrl: text(formData, "mapUrl"),
    dressCode: text(formData, "dressCode"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the event and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await saveEvent(await currentUserId(), weddingId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  return { ok: true, message: "Event saved." };
}

export async function deleteEventAction(formData: FormData) {
  try {
    await deleteEvent(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "eventId"),
    );
  } catch (error) {
    console.error(error);
  }
}

function partyInput(formData: FormData) {
  const firstNames = formData.getAll("memberFirstName").map((value) => String(value));
  const lastNames = formData.getAll("memberLastName").map((value) => String(value));
  const emails = formData.getAll("memberEmail").map((value) => String(value));
  const phones = formData.getAll("memberPhone").map((value) => String(value));
  return guestPartySchema.safeParse({
    name: text(formData, "name"),
    maxGuests: text(formData, "maxGuests"),
    groupId: text(formData, "groupId"),
    newGroupName: text(formData, "newGroupName"),
    members: firstNames.map((firstName, index) => ({
      firstName,
      lastName: lastNames[index] ?? "",
      email: emails[index] ?? "",
      phone: phones[index] ?? "",
    })),
  });
}

export async function createGuestPartyAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = partyInput(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the guest party and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await createGuestParty(await currentUserId(), weddingId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  return { ok: true, message: "Guest party added." };
}

export async function updateGuestPartyAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const partyId = text(formData, "partyId");
  const parsed = partyInput(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the guest party and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await updateGuestParty(await currentUserId(), weddingId, partyId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  const next = nextPath(formData);
  if (next) {
    redirect(next);
  }
  return { ok: true, message: "Guest party saved." };
}

export async function deleteGuestPartyAction(formData: FormData) {
  try {
    await deleteGuestParty(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "partyId"),
    );
  } catch (error) {
    console.error(error);
  }
}

export async function importGuestsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a CSV file." };
  }
  if (file.size > 200_000) {
    return { ok: false, message: "That CSV is too large." };
  }

  try {
    await importGuestCsv(await currentUserId(), weddingId, await file.text());
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  return { ok: true, message: "Guests imported." };
}

export async function markInvitationSentAction(formData: FormData) {
  try {
    await markInvitationSent(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "partyId"),
    );
  } catch (error) {
    console.error(error);
  }
}

export async function createGuestGroupAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  const parsed = guestGroupSchema.safeParse({ name: text(formData, "name") });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the group name and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await createGuestGroup(await currentUserId(), weddingId, parsed.data);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }

  return { ok: true, message: "Group added." };
}

export async function deleteGuestGroupAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  try {
    await deleteGuestGroup(await currentUserId(), weddingId, text(formData, "groupId"));
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Group removed." };
}

export async function toggleSectionAction(formData: FormData) {
  try {
    await setSectionEnabled(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "sectionId"),
      text(formData, "enabled") === "true",
    );
  } catch (error) {
    console.error(error);
  }
}

export async function moveSectionAction(formData: FormData) {
  const direction = text(formData, "direction");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  try {
    await moveSection(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "sectionId"),
      direction,
    );
  } catch (error) {
    console.error(error);
  }
}

export async function publishWeddingAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  try {
    await publishWedding(await currentUserId(), weddingId);
    await rememberWedding(weddingId);
  } catch (error) {
    return failure(error);
  }
  redirect("/dashboard/wedding?published=1");
}

export async function unpublishWeddingAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const weddingId = text(formData, "weddingId");
  try {
    await unpublishWedding(await currentUserId(), weddingId);
  } catch (error) {
    return failure(error);
  }
  redirect("/dashboard/wedding?unpublished=1");
}

export async function selectWeddingAction(formData: FormData) {
  const weddingId = text(formData, "weddingId");
  try {
    const userId = await currentUserId();
    const member = await prisma.weddingMember.findUnique({
      where: { weddingId_userId: { weddingId, userId } },
      select: { id: true },
    });
    if (member) {
      await rememberWedding(weddingId);
    }
  } catch (error) {
    console.error(error);
  }
  redirect("/dashboard");
}

export async function rememberWeddingAction(weddingId: string) {
  if (!weddingId || weddingId === "new") {
    return;
  }
  try {
    await currentUserId();
    await rememberWedding(weddingId);
  } catch (error) {
    console.error(error);
  }
}

export async function saveStoryItemAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = storyItemSchema.safeParse({
    storyId: text(formData, "storyId"),
    title: text(formData, "title"),
    date: text(formData, "date"),
    description: text(formData, "description"),
    imageUrl: text(formData, "imageUrl"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  try {
    await saveStoryItem(await currentUserId(), text(formData, "weddingId"), parsed.data);
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Story saved." };
}

export async function deleteStoryItemAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await deleteStoryItem(await currentUserId(), text(formData, "weddingId"), text(formData, "storyId"));
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Story removed." };
}

export async function moveStoryItemAction(formData: FormData) {
  const direction = text(formData, "direction");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  try {
    await moveStoryItem(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "storyId"),
      direction,
    );
  } catch (error) {
    console.error(error);
  }
}

export async function saveGalleryItemAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = galleryItemSchema.safeParse({
    galleryId: text(formData, "galleryId"),
    imageUrl: text(formData, "imageUrl"),
    caption: text(formData, "caption"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  try {
    await saveGalleryItem(await currentUserId(), text(formData, "weddingId"), parsed.data);
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Photo saved." };
}

export async function deleteGalleryItemAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await deleteGalleryItem(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "galleryId"),
    );
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Photo removed." };
}

export async function moveGalleryItemAction(formData: FormData) {
  const direction = text(formData, "direction");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  try {
    await moveGalleryItem(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "galleryId"),
      direction,
    );
  } catch (error) {
    console.error(error);
  }
}

export async function saveFaqItemAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = faqItemSchema.safeParse({
    faqId: text(formData, "faqId"),
    question: text(formData, "question"),
    answer: text(formData, "answer"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  try {
    await saveFaqItem(await currentUserId(), text(formData, "weddingId"), parsed.data);
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Question saved." };
}

export async function deleteFaqItemAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await deleteFaqItem(await currentUserId(), text(formData, "weddingId"), text(formData, "faqId"));
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Question removed." };
}

export async function moveFaqItemAction(formData: FormData) {
  const direction = text(formData, "direction");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  try {
    await moveFaqItem(await currentUserId(), text(formData, "weddingId"), text(formData, "faqId"), direction);
  } catch (error) {
    console.error(error);
  }
}
