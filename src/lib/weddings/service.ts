import { Prisma, type WeddingMemberRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { AccessError } from "@/lib/errors";
import { createInviteToken, createPublicId } from "@/lib/ids";
import type {
  CoupleInput,
  EventInput,
  FaqItemInput,
  GalleryItemInput,
  GuestGroupInput,
  GuestPartyInput,
  StoryItemInput,
  ThemeSettingsInput,
  WeddingDetailsInput,
} from "@/lib/validation/wedding";
import { defaultSealInitials } from "@/themes/options";
import { getThemeConfig } from "@/themes/registry";
import { themePalette } from "@/themes/resolve";
import { parseGuestCsv } from "./csv";
import {
  DEFAULT_GUEST_GROUPS,
  DEFAULT_TIMEZONE,
  SECTION_ORDER,
} from "./constants";
import { zonedDateTimeToUtc } from "./datetime";

export class WeddingActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeddingActionError";
  }
}

async function requireMember(userId: string, weddingId: string, roles?: WeddingMemberRole[]) {
  const member = await prisma.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId, userId } },
    include: { wedding: true },
  });

  if (!member || (roles && !roles.includes(member.role))) {
    throw new AccessError("FORBIDDEN");
  }

  return member;
}

async function uniquePublicId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = createPublicId();
    const existing = await prisma.wedding.findUnique({ where: { publicId }, select: { id: true } });
    if (!existing) {
      return publicId;
    }
  }
  throw new WeddingActionError("Could not create a wedding link. Try again.");
}

async function uniqueToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = createInviteToken();
    const existing = await prisma.guestParty.findUnique({ where: { token }, select: { id: true } });
    if (!existing) {
      return token;
    }
  }
  throw new WeddingActionError("Could not create an invitation link. Try again.");
}

async function assertSlugAvailable(slug: string, weddingId?: string) {
  const existing = await prisma.wedding.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== weddingId) {
    throw new WeddingActionError("That wedding link is already taken.");
  }
}

export async function createWedding(userId: string, input: CoupleInput) {
  await assertSlugAvailable(input.slug);
  const publicId = await uniquePublicId();

  try {
    return await prisma.wedding.create({
      data: {
        publicId,
        slug: input.slug,
        partnerOneName: input.partnerOneName,
        partnerTwoName: input.partnerTwoName,
        timezone: DEFAULT_TIMEZONE,
        themeId: "rustic",
        members: {
          create: { userId, role: "OWNER" },
        },
        themeSettings: {
          create: {
            ...themePalette(getThemeConfig("rustic")),
            customConfigJson: {
              envelopeStyle: "kraft",
              sealInitials: defaultSealInitials(input.partnerOneName, input.partnerTwoName),
              musicEnabled: false,
            },
          },
        },
        sections: {
          create: SECTION_ORDER.map((type, sortOrder) => ({
            type,
            enabled: true,
            sortOrder,
          })),
        },
        guestGroups: {
          create: DEFAULT_GUEST_GROUPS.map((name) => ({ name })),
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new WeddingActionError("That wedding link is already taken.");
    }
    throw error;
  }
}

export async function updateCouple(userId: string, weddingId: string, input: CoupleInput) {
  await requireMember(userId, weddingId);
  await assertSlugAvailable(input.slug, weddingId);

  try {
    return await prisma.wedding.update({
      where: { id: weddingId },
      data: {
        partnerOneName: input.partnerOneName,
        partnerTwoName: input.partnerTwoName,
        slug: input.slug,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new WeddingActionError("That wedding link is already taken.");
    }
    throw error;
  }
}

export async function updateWeddingDetails(
  userId: string,
  weddingId: string,
  input: WeddingDetailsInput,
) {
  const member = await requireMember(userId, weddingId);
  const timeZone = input.timezone || member.wedding.timezone;
  const weddingDate = input.weddingDate
    ? zonedDateTimeToUtc(`${input.weddingDate}T00:00`, timeZone)
    : null;

  if (input.weddingDate && !weddingDate) {
    throw new WeddingActionError("Choose a valid wedding date.");
  }

  return prisma.wedding.update({
    where: { id: weddingId },
    data: {
      weddingDate,
      timezone: timeZone,
      location: input.location,
      description: input.description,
    },
  });
}

export async function updateTheme(userId: string, weddingId: string, themeId: string) {
  const member = await requireMember(userId, weddingId);
  const palette = themePalette(getThemeConfig(themeId));
  const themeChanged = member.wedding.themeId !== themeId;

  return prisma.wedding.update({
    where: { id: weddingId },
    data: {
      themeId,
      ...(themeChanged
        ? {
            themeSettings: {
              upsert: {
                update: palette,
                create: palette,
              },
            },
          }
        : {}),
    },
  });
}

export async function updateThemeSettings(
  userId: string,
  weddingId: string,
  input: ThemeSettingsInput,
) {
  const member = await requireMember(userId, weddingId);
  const palette = themePalette(getThemeConfig(member.wedding.themeId));
  const customConfigJson = {
    envelopeStyle: input.envelopeStyle,
    sealInitials: input.sealInitials,
    musicEnabled: input.musicEnabled,
    musicUrl: input.musicUrl,
  };

  return prisma.themeSettings.upsert({
    where: { weddingId },
    update: {
      primaryColor: input.primaryColor,
      accentColor: input.accentColor,
      headingFont: input.headingFont,
      bodyFont: input.bodyFont,
      scriptFont: input.scriptFont,
      customConfigJson,
    },
    create: {
      weddingId,
      ...palette,
      primaryColor: input.primaryColor,
      accentColor: input.accentColor,
      headingFont: input.headingFont,
      bodyFont: input.bodyFont,
      scriptFont: input.scriptFont,
      customConfigJson,
    },
  });
}

export async function saveEvent(userId: string, weddingId: string, input: EventInput) {
  const member = await requireMember(userId, weddingId);
  const timeZone = member.wedding.timezone;
  const startAt = zonedDateTimeToUtc(input.startAt, timeZone);
  const endAt = input.endAt ? zonedDateTimeToUtc(input.endAt, timeZone) : null;

  if (!startAt || (input.endAt && !endAt)) {
    throw new WeddingActionError("Choose a valid date and time.");
  }
  if (endAt && endAt <= startAt) {
    throw new WeddingActionError("The end time must be after the start time.");
  }

  const data = {
    name: input.name,
    description: input.description,
    startAt,
    endAt,
    venueName: input.venueName,
    address: input.address,
    mapUrl: input.mapUrl,
    dressCode: input.dressCode,
  };

  if (input.eventId) {
    const existing = await prisma.event.findFirst({
      where: { id: input.eventId, weddingId },
      select: { id: true },
    });
    if (!existing) {
      throw new WeddingActionError("That event could not be found.");
    }
    return prisma.event.update({ where: { id: existing.id }, data });
  }

  const last = await prisma.event.findFirst({
    where: { weddingId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return prisma.event.create({
    data: {
      ...data,
      weddingId,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function deleteEvent(userId: string, weddingId: string, eventId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.event.findFirst({
    where: { id: eventId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That event could not be found.");
  }
  await prisma.event.delete({ where: { id: existing.id } });
}

async function resolveGroupId(
  weddingId: string,
  groupId: string | null,
  newGroupName: string | null,
) {
  if (newGroupName) {
    const group = await prisma.guestGroup.upsert({
      where: { weddingId_name: { weddingId, name: newGroupName } },
      update: {},
      create: { weddingId, name: newGroupName },
    });
    return group.id;
  }

  if (!groupId) {
    return null;
  }

  const group = await prisma.guestGroup.findFirst({
    where: { id: groupId, weddingId },
    select: { id: true },
  });
  if (!group) {
    throw new WeddingActionError("Choose a guest group from this wedding.");
  }
  return group.id;
}

async function assertPartyNameAvailable(weddingId: string, name: string, partyId?: string) {
  const parties = await prisma.guestParty.findMany({
    where: { weddingId },
    select: { id: true, name: true },
  });
  const taken = parties.some(
    (party) => party.id !== partyId && party.name.toLowerCase() === name.toLowerCase(),
  );
  if (taken) {
    throw new WeddingActionError(`A party named "${name}" already exists.`);
  }
}

export async function createGuestParty(userId: string, weddingId: string, input: GuestPartyInput) {
  await requireMember(userId, weddingId);
  await assertPartyNameAvailable(weddingId, input.name);
  const guestGroupId = await resolveGroupId(weddingId, input.groupId, input.newGroupName);
  const token = await uniqueToken();

  return prisma.guestParty.create({
    data: {
      weddingId,
      guestGroupId,
      name: input.name,
      token,
      maxGuests: input.maxGuests,
      guests: {
        create: input.members.map((member, index) => ({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          primaryGuest: index === 0,
        })),
      },
    },
  });
}

export async function updateGuestParty(
  userId: string,
  weddingId: string,
  partyId: string,
  input: GuestPartyInput,
) {
  await requireMember(userId, weddingId);
  const existing = await prisma.guestParty.findFirst({
    where: { id: partyId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That guest party could not be found.");
  }

  await assertPartyNameAvailable(weddingId, input.name, existing.id);
  const guestGroupId = await resolveGroupId(weddingId, input.groupId, input.newGroupName);

  return prisma.$transaction(async (tx) => {
    await tx.guest.deleteMany({ where: { guestPartyId: existing.id } });
    return tx.guestParty.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        maxGuests: input.maxGuests,
        guestGroupId,
        guests: {
          create: input.members.map((member, index) => ({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            primaryGuest: index === 0,
          })),
        },
      },
    });
  });
}

export async function deleteGuestParty(userId: string, weddingId: string, partyId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.guestParty.findFirst({
    where: { id: partyId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That guest party could not be found.");
  }
  await prisma.guestParty.delete({ where: { id: existing.id } });
}

export async function markInvitationSent(userId: string, weddingId: string, partyId: string) {
  await requireMember(userId, weddingId);
  const party = await prisma.guestParty.findFirst({
    where: { id: partyId, weddingId },
    select: { id: true, inviteStatus: true, inviteSentAt: true },
  });
  if (!party) {
    throw new WeddingActionError("That guest party could not be found.");
  }
  if (party.inviteStatus !== "NOT_SENT") {
    return;
  }

  await prisma.guestParty.update({
    where: { id: party.id },
    data: {
      inviteStatus: "SENT",
      inviteSentAt: party.inviteSentAt ?? new Date(),
    },
  });
}

export async function createGuestGroup(userId: string, weddingId: string, input: GuestGroupInput) {
  await requireMember(userId, weddingId);
  try {
    return await prisma.guestGroup.create({
      data: { weddingId, name: input.name },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new WeddingActionError("That group already exists.");
    }
    throw error;
  }
}

export async function deleteGuestGroup(userId: string, weddingId: string, groupId: string) {
  await requireMember(userId, weddingId);
  const group = await prisma.guestGroup.findFirst({
    where: { id: groupId, weddingId },
    include: { _count: { select: { parties: true } } },
  });
  if (!group) {
    throw new WeddingActionError("That guest group could not be found.");
  }
  if (group._count.parties > 0) {
    throw new WeddingActionError("Move or remove that group's parties before deleting it.");
  }
  await prisma.guestGroup.delete({ where: { id: group.id } });
}

export async function importGuestCsv(userId: string, weddingId: string, csv: string) {
  await requireMember(userId, weddingId);
  const parsed = parseGuestCsv(csv);
  if (!parsed.ok) {
    throw new WeddingActionError(parsed.message);
  }

  const existingNames = await prisma.guestParty.findMany({
    where: { weddingId },
    select: { name: true },
  });
  const taken = new Set(existingNames.map((party) => party.name.toLowerCase()));
  const duplicate = parsed.parties.find((party) => taken.has(party.name.toLowerCase()));
  if (duplicate) {
    throw new WeddingActionError(`A party named "${duplicate.name}" already exists.`);
  }

  await prisma.$transaction(async (tx) => {
    for (const party of parsed.parties) {
      let guestGroupId: string | null = null;
      if (party.groupName) {
        const group = await tx.guestGroup.upsert({
          where: { weddingId_name: { weddingId, name: party.groupName } },
          update: {},
          create: { weddingId, name: party.groupName },
        });
        guestGroupId = group.id;
      }

      const token = await uniqueToken();
      await tx.guestParty.create({
        data: {
          weddingId,
          guestGroupId,
          name: party.name,
          token,
          maxGuests: party.maxGuests,
          guests: {
            create: party.members.map((member, index) => ({
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              phone: member.phone,
              primaryGuest: index === 0,
            })),
          },
        },
      });
    }
  });
}

export async function setSectionEnabled(
  userId: string,
  weddingId: string,
  sectionId: string,
  enabled: boolean,
) {
  await requireMember(userId, weddingId);
  const section = await prisma.weddingSection.findFirst({
    where: { id: sectionId, weddingId },
    select: { id: true },
  });
  if (!section) {
    throw new WeddingActionError("That section could not be found.");
  }
  await prisma.weddingSection.update({
    where: { id: section.id },
    data: { enabled },
  });
}

export async function moveSection(
  userId: string,
  weddingId: string,
  sectionId: string,
  direction: "up" | "down",
) {
  await requireMember(userId, weddingId);
  const sections = await prisma.weddingSection.findMany({
    where: { weddingId },
    orderBy: { sortOrder: "asc" },
  });
  const index = sections.findIndex((section) => section.id === sectionId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= sections.length) {
    return;
  }

  const current = sections[index];
  const neighbor = sections[swapWith];
  await prisma.$transaction([
    prisma.weddingSection.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.weddingSection.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
}

export async function publishWedding(userId: string, weddingId: string) {
  const member = await requireMember(userId, weddingId, ["OWNER", "ADMIN"]);
  if (!member.wedding.weddingDate) {
    throw new WeddingActionError("Add a wedding date before publishing.");
  }

  return prisma.wedding.update({
    where: { id: weddingId },
    data: {
      status: "PUBLISHED",
      publishedAt: member.wedding.publishedAt ?? new Date(),
    },
  });
}

export async function unpublishWedding(userId: string, weddingId: string) {
  await requireMember(userId, weddingId, ["OWNER", "ADMIN"]);
  return prisma.wedding.update({
    where: { id: weddingId },
    data: { status: "DRAFT" },
  });
}

export async function saveStoryItem(userId: string, weddingId: string, input: StoryItemInput) {
  await requireMember(userId, weddingId);
  if (input.storyId) {
    const existing = await prisma.storyItem.findFirst({
      where: { id: input.storyId, weddingId },
      select: { id: true },
    });
    if (!existing) {
      throw new WeddingActionError("That story entry could not be found.");
    }
    return prisma.storyItem.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        date: input.date,
        description: input.description,
        imageUrl: input.imageUrl,
      },
    });
  }

  const last = await prisma.storyItem.findFirst({
    where: { weddingId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.storyItem.create({
    data: {
      weddingId,
      title: input.title,
      date: input.date,
      description: input.description,
      imageUrl: input.imageUrl,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function deleteStoryItem(userId: string, weddingId: string, storyId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.storyItem.findFirst({
    where: { id: storyId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That story entry could not be found.");
  }
  await prisma.storyItem.delete({ where: { id: existing.id } });
}

export async function moveStoryItem(
  userId: string,
  weddingId: string,
  storyId: string,
  direction: "up" | "down",
) {
  await requireMember(userId, weddingId);
  const items = await prisma.storyItem.findMany({
    where: { weddingId },
    orderBy: { sortOrder: "asc" },
  });
  await swapSortOrder(items, storyId, direction, (id, sortOrder) =>
    prisma.storyItem.update({ where: { id }, data: { sortOrder } }),
  );
}

export async function saveGalleryItem(userId: string, weddingId: string, input: GalleryItemInput) {
  await requireMember(userId, weddingId);
  if (input.galleryId) {
    const existing = await prisma.galleryItem.findFirst({
      where: { id: input.galleryId, weddingId },
      select: { id: true },
    });
    if (!existing) {
      throw new WeddingActionError("That photo could not be found.");
    }
    return prisma.galleryItem.update({
      where: { id: existing.id },
      data: { imageUrl: input.imageUrl, caption: input.caption },
    });
  }

  const last = await prisma.galleryItem.findFirst({
    where: { weddingId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.galleryItem.create({
    data: {
      weddingId,
      imageUrl: input.imageUrl,
      caption: input.caption,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function deleteGalleryItem(userId: string, weddingId: string, galleryId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.galleryItem.findFirst({
    where: { id: galleryId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That photo could not be found.");
  }
  await prisma.galleryItem.delete({ where: { id: existing.id } });
}

export async function moveGalleryItem(
  userId: string,
  weddingId: string,
  galleryId: string,
  direction: "up" | "down",
) {
  await requireMember(userId, weddingId);
  const items = await prisma.galleryItem.findMany({
    where: { weddingId },
    orderBy: { sortOrder: "asc" },
  });
  await swapSortOrder(items, galleryId, direction, (id, sortOrder) =>
    prisma.galleryItem.update({ where: { id }, data: { sortOrder } }),
  );
}

export async function saveFaqItem(userId: string, weddingId: string, input: FaqItemInput) {
  await requireMember(userId, weddingId);
  if (input.faqId) {
    const existing = await prisma.faqItem.findFirst({
      where: { id: input.faqId, weddingId },
      select: { id: true },
    });
    if (!existing) {
      throw new WeddingActionError("That question could not be found.");
    }
    return prisma.faqItem.update({
      where: { id: existing.id },
      data: { question: input.question, answer: input.answer },
    });
  }

  const last = await prisma.faqItem.findFirst({
    where: { weddingId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.faqItem.create({
    data: {
      weddingId,
      question: input.question,
      answer: input.answer,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function deleteFaqItem(userId: string, weddingId: string, faqId: string) {
  await requireMember(userId, weddingId);
  const existing = await prisma.faqItem.findFirst({
    where: { id: faqId, weddingId },
    select: { id: true },
  });
  if (!existing) {
    throw new WeddingActionError("That question could not be found.");
  }
  await prisma.faqItem.delete({ where: { id: existing.id } });
}

export async function moveFaqItem(
  userId: string,
  weddingId: string,
  faqId: string,
  direction: "up" | "down",
) {
  await requireMember(userId, weddingId);
  const items = await prisma.faqItem.findMany({
    where: { weddingId },
    orderBy: { sortOrder: "asc" },
  });
  await swapSortOrder(items, faqId, direction, (id, sortOrder) =>
    prisma.faqItem.update({ where: { id }, data: { sortOrder } }),
  );
}

function swapSortOrder(
  items: { id: string; sortOrder: number }[],
  id: string,
  direction: "up" | "down",
  update: (id: string, sortOrder: number) => Prisma.PrismaPromise<unknown>,
) {
  const index = items.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) {
    return Promise.resolve();
  }
  const current = items[index];
  const neighbor = items[swapWith];
  return prisma.$transaction([
    update(current.id, neighbor.sortOrder),
    update(neighbor.id, current.sortOrder),
  ]);
}

export async function getWeddingSummary(weddingId: string) {
  const [guestCount, parties, invites, attendees, recent] = await Promise.all([
    prisma.guest.count({ where: { guestParty: { weddingId } } }),
    prisma.guestParty.groupBy({
      by: ["rsvpStatus"],
      where: { weddingId },
      _count: { _all: true },
    }),
    prisma.guestParty.groupBy({
      by: ["inviteStatus"],
      where: { weddingId },
      _count: { _all: true },
    }),
    prisma.rSVP.aggregate({
      where: { guestParty: { weddingId } },
      _sum: { attendeeCount: true },
    }),
    prisma.guestParty.findMany({
      where: { weddingId, rsvpSubmittedAt: { not: null } },
      orderBy: { rsvpSubmittedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        rsvpStatus: true,
        rsvpSubmittedAt: true,
        rsvp: { select: { attendeeCount: true } },
      },
    }),
  ]);

  const countFor = (status: "PENDING" | "ACCEPTED" | "DECLINED") =>
    parties.find((party) => party.rsvpStatus === status)?._count._all ?? 0;
  const inviteCount = (status: "NOT_SENT" | "SENT" | "OPENED") =>
    invites.find((party) => party.inviteStatus === status)?._count._all ?? 0;
  const accepted = countFor("ACCEPTED");
  const declined = countFor("DECLINED");
  const pending = countFor("PENDING");
  const partyCount = accepted + declined + pending;
  const invitationsSent = inviteCount("SENT") + inviteCount("OPENED");
  const invitationsOpened = inviteCount("OPENED");

  return {
    guestCount,
    accepted,
    declined,
    pending,
    attendeeCount: attendees._sum.attendeeCount ?? 0,
    invitationsSent,
    invitationsOpened,
    openRate: invitationsSent === 0 ? null : Math.round((invitationsOpened / invitationsSent) * 100),
    rsvpCompletion: partyCount === 0 ? null : Math.round(((accepted + declined) / partyCount) * 100),
    recent,
  };
}
