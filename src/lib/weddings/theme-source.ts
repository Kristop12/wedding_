import { qrFileName } from "@/lib/storage/objects";
import type { loadThemeWorkspace } from "@/lib/weddings/queries";
import type { ThemeWeddingSource } from "@/themes/view-model";

type LoadedWedding = NonNullable<Awaited<ReturnType<typeof loadThemeWorkspace>>>["wedding"];

export function toThemeSource(wedding: LoadedWedding): ThemeWeddingSource {
  return {
    partnerOneName: wedding.partnerOneName,
    partnerTwoName: wedding.partnerTwoName,
    weddingDate: wedding.weddingDate,
    timezone: wedding.timezone,
    location: wedding.location,
    description: wedding.description,
    themeId: wedding.themeId,
    themeSettings: wedding.themeSettings,
    sections: wedding.sections,
    events: wedding.events,
    storyItems: wedding.storyItems,
    galleryItems: wedding.galleryItems,
    faqItems: wedding.faqItems,
    giftAccounts: wedding.giftAccounts.map((gift) => ({
      id: gift.id,
      type: gift.type,
      displayName: gift.displayName,
      accountName: gift.accountName,
      institutionName: gift.institutionName,
      maskedAccountNumber: gift.maskedAccountNumber,
      description: gift.description,
      externalUrl: gift.externalUrl,
      imageUrl: qrFileName(gift.qrImageUrl) ? `/dashboard/gifts/qr/${gift.id}` : null,
    })),
    entourageGuests: wedding.guestParties
      .filter((party) => party.guestGroup?.name === "Entourage")
      .flatMap((party) => party.guests),
    greetingNames: wedding.guestParties[0]?.guests.map((guest) => guest.firstName) ?? [],
  };
}
