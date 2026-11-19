import { prisma } from "@/lib/db/prisma";
import { dressFileName, readDressImage } from "@/lib/storage/objects";
import { isWeddingSlug } from "@/lib/weddings/slug";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  if (!isWeddingSlug(slug) || !dressFileName(file)) {
    return new Response(null, { status: 404 });
  }

  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!wedding || wedding.status !== "PUBLISHED") {
    return new Response(null, { status: 404 });
  }

  const item = await prisma.dressCodeImage.findFirst({
    where: { weddingId: wedding.id, imageKey: `dress/${file}` },
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
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
