"use server";

import { getSession } from "@/lib/auth/session";
import { AccessError } from "@/lib/errors";
import { inspectQrImage } from "@/lib/storage/objects";
import { deleteGiftAccount, moveGiftAccount, saveGiftAccount } from "@/lib/weddings/gifts";
import { WeddingActionError } from "@/lib/weddings/service";
import { fieldErrorsFromZod, giftAccountSchema } from "@/lib/validation/gift";

export type GiftActionState = {
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

function failure(error: unknown): GiftActionState {
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

export async function saveGiftAccountAction(
  _previous: GiftActionState,
  formData: FormData,
): Promise<GiftActionState> {
  const parsed = giftAccountSchema.safeParse({
    giftId: text(formData, "giftId"),
    type: text(formData, "type"),
    displayName: text(formData, "displayName"),
    accountName: text(formData, "accountName"),
    institutionName: text(formData, "institutionName"),
    maskedAccountNumber: text(formData, "maskedAccountNumber"),
    externalUrl: text(formData, "externalUrl"),
    description: text(formData, "description"),
    isEnabled: text(formData, "isEnabled") === "true",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const upload = formData.get("qrImage");
  let image: { bytes: Uint8Array; extension: "jpg" | "png" | "webp"; contentType: string } | null = null;
  if (upload instanceof File && upload.size > 0) {
    const bytes = new Uint8Array(await upload.arrayBuffer());
    const inspected = inspectQrImage(bytes);
    if (!inspected) {
      return { ok: false, fieldErrors: { qrImage: "Use a JPG, PNG, or WebP image up to 2 MB." } };
    }
    image = { bytes, ...inspected };
  }

  try {
    await saveGiftAccount(await currentUserId(), text(formData, "weddingId"), parsed.data, image);
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Gift saved." };
}

export async function deleteGiftAccountAction(
  _previous: GiftActionState,
  formData: FormData,
): Promise<GiftActionState> {
  try {
    await deleteGiftAccount(await currentUserId(), text(formData, "weddingId"), text(formData, "giftId"));
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Gift removed." };
}

export async function moveGiftAccountAction(formData: FormData) {
  const direction = text(formData, "direction");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  try {
    await moveGiftAccount(
      await currentUserId(),
      text(formData, "weddingId"),
      text(formData, "giftId"),
      direction,
    );
  } catch (error) {
    console.error(error);
  }
}
