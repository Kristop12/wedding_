"use server";

import { getSession } from "@/lib/auth/session";
import { AccessError } from "@/lib/errors";
import { inspectImage } from "@/lib/storage/objects";
import {
  deleteDressCodeImage,
  moveDressCodeImage,
  saveDressCodeImage,
  updateDressCodeImageCaption,
} from "@/lib/weddings/dress-code";
import { WeddingActionError } from "@/lib/weddings/service";
import { z } from "zod";

export type DressCodeActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

const captionSchema = z
  .string()
  .trim()
  .max(160, "Keep the caption under 160 characters.")
  .optional()
  .transform((value) => (value ? value : null));

async function currentUserId() {
  const session = await getSession();
  if (!session) {
    throw new AccessError("UNAUTHORIZED");
  }
  return session.user.id;
}

function failure(error: unknown): DressCodeActionState {
  if (error instanceof AccessError) {
    return { ok: false, message: "You do not have permission to do that." };
  }
  if (error instanceof WeddingActionError) {
    return { ok: false, message: error.message };
  }
  console.error(error);
  return { ok: false, message: "Something went wrong. Try again." };
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveDressCodeImageAction(
  _previous: DressCodeActionState,
  formData: FormData,
): Promise<DressCodeActionState> {
  const captionParsed = captionSchema.safeParse(text(formData, "caption"));
  if (!captionParsed.success) {
    return {
      ok: false,
      fieldErrors: { caption: captionParsed.error.issues[0]?.message ?? "Check the caption." },
    };
  }

  const upload = formData.get("image");
  if (!(upload instanceof File) || upload.size === 0) {
    return { ok: false, fieldErrors: { image: "Choose a JPG, PNG, or WebP image." } };
  }
  const bytes = new Uint8Array(await upload.arrayBuffer());
  const inspected = inspectImage(bytes);
  if (!inspected) {
    return { ok: false, fieldErrors: { image: "Use a JPG, PNG, or WebP image up to 2 MB." } };
  }

  try {
    await saveDressCodeImage(
      await currentUserId(),
      text(formData, "weddingId"),
      captionParsed.data,
      { bytes, ...inspected },
    );
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Dress code image added." };
}

export async function updateDressCodeCaptionAction(
  _previous: DressCodeActionState,
  formData: FormData,
): Promise<DressCodeActionState> {
  const captionParsed = captionSchema.safeParse(text(formData, "caption"));
  if (!captionParsed.success) {
    return {
      ok: false,
      fieldErrors: { caption: captionParsed.error.issues[0]?.message ?? "Check the caption." },
    };
  }

  try {
    await updateDressCodeImageCaption(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "imageId"),
      captionParsed.data,
    );
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Caption saved." };
}

export async function deleteDressCodeImageAction(
  _previous: DressCodeActionState,
  formData: FormData,
): Promise<DressCodeActionState> {
  try {
    await deleteDressCodeImage(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "imageId"),
    );
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Image removed." };
}

export async function moveDressCodeImageAction(formData: FormData) {
  const direction = text(formData, "direction");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  try {
    await moveDressCodeImage(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "imageId"),
      direction,
    );
  } catch {
    // Keep the list quiet when reorder fails.
  }
}
