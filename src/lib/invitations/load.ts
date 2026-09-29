import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import type { ThemeViewModel } from "@/themes/types";
import { qrFileName } from "@/lib/storage/objects";
import { buildThemeViewModel } from "@/themes/view-model";

const TOKEN = /^[A-Z0-9]{8,32}$/;

export async function loadInvitation(token: string) {
  if (!TOKEN.test(token)) {
    return { status: "missing" as const };
  }

  const party = await prisma.guestParty.findUnique({
    where: { token },
    include: {
      guests: {
        orderBy: { createdAt: "asc" },
        select: { firstName: true, lastName: true },
      },
      rsvp: {
        include: { attendees: { orderBy: { createdAt: "asc" } } },
      },
      wedding: {
        include: {
          themeSettings: true,
          sections: { orderBy: { sortOrder: "asc" } },
          events: { orderBy: [{ sortOrder: "asc" }, { startAt: "asc" }] },
          storyItems: { orderBy: { sortOrder: "asc" } },
          galleryItems: { orderBy: { sortOrder: "asc" } },
          faqItems: { orderBy: { sortOrder: "asc" } },
          giftAccounts: {
            where: { isEnabled: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              type: true,
              displayName: true,
              accountName: true,
              institutionName: true,
              maskedAccountNumber: true,
              description: true,
              externalUrl: true,
              qrImageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!party) {
    return { status: "missing" as const };
  }

  if (party.wedding.status === "ARCHIVED") {
    return { status: "disabled" as const };
  }

  if (party.wedding.status !== "PUBLISHED") {
    return { status: "unpublished" as const };
  }

  const entourage = await prisma.guest.findMany({
    where: {
      guestParty: { weddingId: party.weddingId, guestGroup: { name: "Entourage" } },
    },
    select: { firstName: true, lastName: true },
    orderBy: { createdAt: "asc" },
  });

  const wedding = party.wedding;
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
    giftAccounts: wedding.giftAccounts.map((gift) => {
      const file = qrFileName(gift.qrImageUrl);
      return {
        id: gift.id,
        type: gift.type,
        displayName: gift.displayName,
        accountName: gift.accountName,
        institutionName: gift.institutionName,
        maskedAccountNumber: gift.maskedAccountNumber,
        description: gift.description,
        externalUrl: gift.externalUrl,
        imageUrl: file ? `/i/${party.token}/qr/${file}` : null,
      };
    }),
    entourageGuests: entourage,
    greetingNames: party.guests.map((guest) => guest.firstName),
    faqItems: wedding.faqItems,
  });

  return {
    status: "ready" as const,
    partyId: party.id,
    model: { ...withoutInternalIds(model), audience: "invitation" as const },
    reply: {
      token: party.token,
      maxGuests: party.maxGuests,
      guestNames: party.guests.map((guest) => `${guest.firstName} ${guest.lastName}`.trim()),
      status: party.rsvp?.status ?? party.rsvpStatus,
      message: party.rsvp?.message ?? "",
      attendees: (party.rsvp?.attendees ?? []).map((attendee) => ({
        name: attendee.name,
        meal: attendee.mealPreference ?? "",
        dietary: attendee.dietaryRequirements ?? "",
      })),
    },
  };
}

function withoutInternalIds(model: ThemeViewModel): ThemeViewModel {
  return {
    ...model,
    events: model.events.map((event, index) => ({ ...event, id: `event-${index}` })),
    story: model.story.map((item, index) => ({ ...item, id: `story-${index}` })),
    gallery: model.gallery.map((item, index) => ({ ...item, id: `photo-${index}` })),
    faqs: model.faqs.map((item, index) => ({ ...item, id: `faq-${index}` })),
    gifts: model.gifts.map((gift, index) => ({ ...gift, id: `gift-${index}` })),
  };
}

export async function recordInvitationOpen(partyId: string) {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip")?.trim() || "";
  const ipHash = ip ? createHash("sha256").update(`${env.AUTH_SECRET}:${ip}`).digest("hex") : null;
  const userAgent = headerList.get("user-agent")?.slice(0, 255) ?? null;
  const now = new Date();
  const existing = await prisma.guestParty.findUnique({
    where: { id: partyId },
    select: { inviteOpenedAt: true },
  });

  await prisma.$transaction([
    prisma.guestParty.update({
      where: { id: partyId },
      data: {
        inviteStatus: "OPENED",
        inviteOpenedAt: existing?.inviteOpenedAt ?? now,
        lastViewedAt: now,
      },
    }),
    prisma.invitationView.create({
      data: { guestPartyId: partyId, userAgent, ipHash },
    }),
  ]);
}
