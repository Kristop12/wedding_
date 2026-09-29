import { GalleryManager } from "@/components/wedding/gallery-manager";
import { NoWedding } from "@/components/wedding/no-wedding";
import { loadGalleryContent } from "@/lib/weddings/queries";

export default async function GalleryPage() {
  const content = await loadGalleryContent();
  if (!content) {
    return <NoWedding title="Gallery" />;
  }

  return <GalleryManager weddingId={content.wedding.id} items={content.wedding.galleryItems} />;
}
