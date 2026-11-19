import { prisma } from "@/lib/db/prisma";
import { AccessError } from "@/lib/errors";
import { deleteDressImage, saveDressImage } from "@/lib/storage/objects";
import { WeddingActionError } from "@/lib/weddings/service";

const MAX_DRESS_IMAGES = 6;

type DressUpload = {
  bytes: Uint8Array;
  extension: "jpg" | "png" | "webp";
  contentType: string;
};

export async function saveDressCodeImage(
  userId: string,
  weddingId: string,
  caption: string | null,
  image: DressUpload,
) {
  await requireMember(userId, weddingId);

  const count = await prisma.dressCodeImage.count({ where: { weddingId } });
  if (count >= MAX_DRESS_IMAGES) {
    throw new WeddingActionError("You can add up to 6 dress code images.");
  }

  const nextKey = await saveDressImage(image.bytes, image.extension, image.contentType);
  try {
    return await prisma.dressCodeImage.create({
      data: {
        weddingId,
        imageKey: nextKey,
        caption,
        sortOrder: await nextSortOrder(weddingId),
      },
    });
  } catch (error) {
    await deleteDressImage(nextKey);
    throw error;
  }
}

export async function updateDressCodeImageCaption(
  userId: string,
  weddingId: string,
  imageId: string,
  caption: string | null,
) {
  await requireMember(userId, weddingId);
  const existing = await prisma.dressCodeImage.findFirst({
    where: { id: imageId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That image could not be found.");
  }
  return prisma.dressCodeImage.update({
    where: { id: existing.id },
    data: { caption },
  });
}

export async function deleteDressCodeImage(userId: string, weddingId: string, imageId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.dressCodeImage.findFirst({
    where: { id: imageId, weddingId },
    select: { id: true, imageKey: true },
  });
  if (!existing) {
    throw new WeddingActionError("That image could not be found.");
  }
  await prisma.dressCodeImage.delete({ where: { id: existing.id } });
  await deleteDressImage(existing.imageKey);
}

export async function moveDressCodeImage(
  userId: string,
  weddingId: string,
  imageId: string,
  direction: "up" | "down",
) {
  await requireMember(userId, weddingId);
  const items = await prisma.dressCodeImage.findMany({
    where: { weddingId },
    orderBy: { sortOrder: "asc" },
  });
  const index = items.findIndex((item) => item.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) {
    return;
  }
  const current = items[index];
  const neighbor = items[swapWith];
  await prisma.$transaction([
    prisma.dressCodeImage.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.dressCodeImage.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);
}

async function nextSortOrder(weddingId: string) {
  const last = await prisma.dressCodeImage.findFirst({
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
