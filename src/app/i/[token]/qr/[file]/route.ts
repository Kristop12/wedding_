import { prisma } from "@/lib/db/prisma";
import { qrFileName, readQrImage } from "@/lib/storage/objects";

export const dynamic = "force-dynamic";

const TOKEN = /^[A-Z0-9]{8,32}$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; file: string }> },
) {
  const { token, file } = await params;
  if (!TOKEN.test(token) || !qrFileName(file)) {
    return new Response(null, { status: 404 });
  }

  const party = await prisma.guestParty.findUnique({
    where: { token },
    select: { weddingId: true, wedding: { select: { status: true } } },
  });
  if (!party || party.wedding.status !== "PUBLISHED") {
    return new Response(null, { status: 404 });
  }

  const gift = await prisma.giftAccount.findFirst({
    where: { weddingId: party.weddingId, qrImageUrl: `qr/${file}`, isEnabled: true },
    select: { id: true },
  });
  if (!gift) {
    return new Response(null, { status: 404 });
  }

  const image = await readQrImage(`qr/${file}`);
  if (!image) {
    return new Response(null, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${file}"`,
    },
  });
}
