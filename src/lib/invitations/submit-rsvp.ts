import { prisma } from "@/lib/db/prisma";
import type { RsvpInput } from "@/lib/validation/rsvp";

const TOKEN = /^[A-Z0-9]{8,32}$/;

export class RsvpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RsvpError";
  }
}

export async function submitPartyRsvp(token: string, input: RsvpInput) {
  if (!TOKEN.test(token)) {
    throw new RsvpError("This invitation is not available.");
  }

  const party = await prisma.guestParty.findUnique({
    where: { token },
    select: {
      id: true,
      maxGuests: true,
      wedding: { select: { status: true } },
    },
  });

  if (!party || party.wedding.status !== "PUBLISHED") {
    throw new RsvpError("This invitation is not available.");
  }

  const attendees = input.status === "ACCEPTED" ? input.attendees : [];
  if (input.status === "ACCEPTED" && attendees.length > party.maxGuests) {
    throw new RsvpError(
      party.maxGuests === 1
        ? "This invitation is for 1 guest."
        : `This invitation is for up to ${party.maxGuests} guests.`,
    );
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const rsvp = await tx.rSVP.upsert({
      where: { guestPartyId: party.id },
      create: {
        guestPartyId: party.id,
        status: input.status,
        attendeeCount: attendees.length,
        message: input.message,
        submittedAt: now,
      },
      update: {
        status: input.status,
        attendeeCount: attendees.length,
        message: input.message,
        submittedAt: now,
      },
    });

    await tx.rSVPAttendee.deleteMany({ where: { rsvpId: rsvp.id } });
    if (attendees.length > 0) {
      await tx.rSVPAttendee.createMany({
        data: attendees.map((attendee) => ({
          rsvpId: rsvp.id,
          name: attendee.name,
          mealPreference: attendee.mealPreference,
          dietaryRequirements: attendee.dietaryRequirements,
        })),
      });
    }

    await tx.guestParty.update({
      where: { id: party.id },
      data: { rsvpStatus: input.status, rsvpSubmittedAt: now },
    });
  });
}
