import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ACTIVE_WEDDING_COOKIE } from "./constants";

export async function getActiveWedding() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const cookieStore = await cookies();
  const requestedId = cookieStore.get(ACTIVE_WEDDING_COOKIE)?.value;
  if (requestedId) {
    const selected = await prisma.weddingMember.findUnique({
      where: {
        weddingId_userId: {
          weddingId: requestedId,
          userId: session.user.id,
        },
      },
      include: { wedding: true },
    });
    if (selected) {
      return selected.wedding;
    }
  }

  const latest = await prisma.weddingMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { wedding: { updatedAt: "desc" } },
    include: { wedding: true },
  });

  return latest?.wedding ?? null;
}

export async function listWeddingsForCurrentUser() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return prisma.wedding.findMany({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      partnerOneName: true,
      partnerTwoName: true,
      slug: true,
      status: true,
      weddingDate: true,
      timezone: true,
    },
  });
}

export async function loadWorkspace(weddingId: string) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const member = await prisma.weddingMember.findUnique({
    where: {
      weddingId_userId: {
        weddingId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    notFound();
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      events: { orderBy: [{ sortOrder: "asc" }, { startAt: "asc" }] },
      guestGroups: { orderBy: { name: "asc" } },
      guestParties: {
        orderBy: { createdAt: "asc" },
        include: {
          guestGroup: true,
          guests: { orderBy: { createdAt: "asc" } },
          rsvp: { select: { attendeeCount: true } },
        },
      },
    },
  });

  if (!wedding) {
    notFound();
  }

  return { session, member, wedding };
}

export async function loadActiveWorkspace() {
  const active = await getActiveWedding();
  if (!active) {
    return null;
  }
  return loadWorkspace(active.id);
}

export async function loadThemeWorkspace() {
  const active = await getActiveWedding();
  if (!active) {
    return null;
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: active.id },
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
      guestParties: {
        orderBy: { createdAt: "asc" },
        include: {
          guestGroup: { select: { name: true } },
          guests: { orderBy: { createdAt: "asc" }, select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!wedding) {
    notFound();
  }

  return { wedding };
}

export async function loadWebsiteContent() {
  const active = await getActiveWedding();
  if (!active) {
    return null;
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: active.id },
    include: {
      storyItems: { orderBy: { sortOrder: "asc" } },
      faqItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!wedding) {
    notFound();
  }

  return { wedding };
}

export async function loadRsvpBoard() {
  const active = await getActiveWedding();
  if (!active) {
    return null;
  }

  const parties = await prisma.guestParty.findMany({
    where: { weddingId: active.id },
    orderBy: { name: "asc" },
    include: {
      guests: { orderBy: { createdAt: "asc" }, select: { firstName: true, lastName: true } },
      rsvp: { include: { attendees: { orderBy: { createdAt: "asc" } } } },
    },
  });

  return { wedding: active, parties };
}

export async function loadGiftAccounts() {
  const active = await getActiveWedding();
  if (!active) {
    return null;
  }

  const gifts = await prisma.giftAccount.findMany({
    where: { weddingId: active.id },
    orderBy: { sortOrder: "asc" },
  });

  return {
    weddingId: active.id,
    gifts: gifts.map((gift) => ({
      id: gift.id,
      type: gift.type,
      displayName: gift.displayName,
      accountName: gift.accountName ?? "",
      institutionName: gift.institutionName ?? "",
      maskedAccountNumber: gift.maskedAccountNumber ?? "",
      externalUrl: gift.externalUrl ?? "",
      description: gift.description ?? "",
      isEnabled: gift.isEnabled,
      hasQr: Boolean(gift.qrImageUrl),
    })),
  };
}

export async function loadGalleryContent() {
  const active = await getActiveWedding();
  if (!active) {
    return null;
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: active.id },
    include: {
      galleryItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!wedding) {
    notFound();
  }

  return { wedding };
}
