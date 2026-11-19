import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { readDressImage } from "@/lib/storage/objects";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return new Response(null, { status: 404 });
  }

  const { imageId } = await params;
  const item = await prisma.dressCodeImage.findFirst({
    where: {
      id: imageId,
      wedding: { members: { some: { userId: session.user.id } } },
    },
    select: { imageKey: true },
  });
  if (!item) {
    return new Response(null, { status: 404 });
  }

  const image = await readDressImage(item.imageKey);
  if (!image) {
    return new Response(null, { status: 404 });
  }

  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
