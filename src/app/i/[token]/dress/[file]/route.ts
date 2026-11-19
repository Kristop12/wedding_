import { prisma } from "@/lib/db/prisma";
import { dressFileName, readDressImage } from "@/lib/storage/objects";

export const dynamic = "force-dynamic";

const TOKEN = /^[A-Z0-9]{8,32}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; file: string }> },
) {
  const { token, file } = await params;
  if (!TOKEN.test(token) || !dressFileName(file)) {
    return new Response(null, { status: 404 });
  }

  const party = await prisma.guestParty.findUnique({
    where: { token },
    select: { weddingId: true, wedding: { select: { status: true } } },
  });
  if (!party || party.wedding.status !== "PUBLISHED") {
    return new Response(null, { status: 404 });
  }

  const item = await prisma.dressCodeImage.findFirst({
    where: { weddingId: party.weddingId, imageKey: `dress/${file}` },
    select: { id: true },
  });
  if (!item) {
    return new Response(null, { status: 404 });
  }

  const image = await readDressImage(`dress/${file}`);
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
