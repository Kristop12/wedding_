import { GiftManager } from "@/components/wedding/gift-manager";
import { NoWedding } from "@/components/wedding/no-wedding";
import { loadGiftAccounts } from "@/lib/weddings/queries";

export default async function GiftsPage() {
  const content = await loadGiftAccounts();
  if (!content) {
    return <NoWedding title="Gifts" />;
  }

  return <GiftManager weddingId={content.weddingId} gifts={content.gifts} />;
}
