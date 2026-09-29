import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { isWeddingSlug } from "@/lib/weddings/slug";
import { buildThemeViewModel } from "@/themes/view-model";
import type { ThemeViewModel } from "@/themes/types";

export const loadPublicWedding = cache(async function loadPublicWedding(slug: string) {
  if (!isWeddingSlug(slug)) {
    return { status: "missing" as const };
  }

  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    include: {
      themeSettings: true,
      sections: { orderBy: { sortOrder: "asc" } },
      events: { orderBy: [{ sortOrder: "asc" }, { startAt: "asc" }] },
      storyItems: { orderBy: { sortOrder: "asc" } },
      galleryItems: { orderBy: { sortOrder: "asc" } },
      faqItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!wedding) {
    return { status: "missing" as const };
  }

  if (wedding.status === "ARCHIVED") {
    return { status: "disabled" as const };
  }

  if (wedding.status !== "PUBLISHED") {
    return { status: "unpublished" as const };
  }

  const entourage = await prisma.guest.findMany({
    where: {
      guestParty: { weddingId: wedding.id, guestGroup: { name: "Entourage" } },
    },
    select: { firstName: true, lastName: true },
    orderBy: { createdAt: "asc" },
  });

  const model = buildThemeViewModel({
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
    giftAccounts: [],
    entourageGuests: entourage,
    greetingNames: [],
  });

  return {
    status: "ready" as const,
    model: publicModel(model),
  };
});

function publicModel(model: ThemeViewModel): ThemeViewModel {
  return {
    ...model,
    audience: "public",
    gifts: [],
    sections: model.sections.filter((section) => section !== "GIFTS"),
    events: model.events.map((event, index) => ({ ...event, id: `event-${index}` })),
    story: model.story.map((item, index) => ({ ...item, id: `story-${index}` })),
    gallery: model.gallery.map((item, index) => ({ ...item, id: `photo-${index}` })),
    faqs: model.faqs.map((item, index) => ({ ...item, id: `faq-${index}` })),
  };
}
