import { prisma } from "@/lib/db/prisma";
import { AccessError } from "@/lib/errors";
import { deleteQrImage, saveQrImage } from "@/lib/storage/objects";
import type { GiftAccountInput } from "@/lib/validation/gift";
import { WeddingActionError } from "@/lib/weddings/service";

type QrUpload = {
  bytes: Uint8Array;
  extension: "jpg" | "png" | "webp";
  contentType: string;
};

export async function saveGiftAccount(
  userId: string,
  weddingId: string,
  input: GiftAccountInput,
  image: QrUpload | null,
) {
  await requireMember(userId, weddingId);
  const existing = input.giftId
    ? await prisma.giftAccount.findFirst({
        where: { id: input.giftId, weddingId },
      })
    : null;
  if (input.giftId && !existing) {
    throw new WeddingActionError("That gift could not be found.");
  }

  const nextKey = image ? await saveQrImage(image.bytes, image.extension, image.contentType) : existing?.qrImageUrl ?? null;
  if (input.type === "QRPH" && input.isEnabled && !nextKey) {
    throw new WeddingActionError("Add a QR image before showing this gift.");
  }

  try {
    const data = {
      type: input.type,
      displayName: input.displayName,
      accountName: input.accountName,
      institutionName: input.institutionName,
      maskedAccountNumber: input.maskedAccountNumber,
      externalUrl: input.externalUrl,
      description: input.description,
      isEnabled: input.isEnabled,
      qrImageUrl: nextKey,
    };
    const saved = existing
      ? await prisma.giftAccount.update({ where: { id: existing.id }, data })
      : await prisma.giftAccount.create({
          data: {
            ...data,
            weddingId,
            sortOrder: await nextSortOrder(weddingId),
          },
        });
    if (image && existing?.qrImageUrl && existing.qrImageUrl !== nextKey) {
      await deleteQrImage(existing.qrImageUrl);
    }
    return saved;
  } catch (error) {
    if (image && nextKey && nextKey !== existing?.qrImageUrl) {
      await deleteQrImage(nextKey);
    }
    throw error;
  }
}

export async function deleteGiftAccount(userId: string, weddingId: string, giftId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.giftAccount.findFirst({
    where: { id: giftId, weddingId },
    select: { id: true, qrImageUrl: true },
  });
  if (!existing) {
    throw new WeddingActionError("That gift could not be found.");
  }
  await prisma.giftAccount.delete({ where: { id: existing.id } });
  await deleteQrImage(existing.qrImageUrl);
}

export async function moveGiftAccount(
  userId: string,
  weddingId: string,
  giftId: string,
  direction: "up" | "down",
) {
  await requireMember(userId, weddingId);
  const items = await prisma.giftAccount.findMany({
    where: { weddingId },
    orderBy: { sortOrder: "asc" },
  });
  const index = items.findIndex((item) => item.id === giftId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) {
    return;
  }
  const current = items[index];
  const neighbor = items[swapWith];
  await prisma.$transaction([
    prisma.giftAccount.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.giftAccount.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);
}

async function nextSortOrder(weddingId: string) {
  const last = await prisma.giftAccount.findFirst({
    where: { weddingId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

async function requireMember(userId: string, weddingId: string) {
  const member = await prisma.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId, userId } },
    select: { id: true },
  });
  if (!member) {
    throw new AccessError("FORBIDDEN");
  }
}
