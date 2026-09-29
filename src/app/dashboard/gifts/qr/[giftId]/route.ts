import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { readQrImage } from "@/lib/storage/objects";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ giftId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return new Response(null, { status: 404 });
  }

  const { giftId } = await params;
  const gift = await prisma.giftAccount.findFirst({
    where: {
      id: giftId,
      qrImageUrl: { not: null },
      wedding: { members: { some: { userId: session.user.id } } },
    },
    select: { qrImageUrl: true },
  });
  if (!gift?.qrImageUrl) {
    return new Response(null, { status: 404 });
  }

  const image = await readQrImage(gift.qrImageUrl);
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
