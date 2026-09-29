import "dotenv/config";
import { auth } from "../src/lib/auth/auth";
import { prisma } from "../src/lib/db/prisma";
import {
  GiftType,
  SectionType,
  WeddingMemberRole,
  WeddingStatus,
} from "../src/generated/prisma/client";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "WeddingDemo123!";
const DEMO_NAME = "Demo Owner";
const WEDDING_SLUG = "kent-and-maria";
const WEDDING_PUBLIC_ID = "KM7P4Q9R2W8X5N3D";
const SANTOS_TOKEN = "7HD29MXQK4N8";
const WEDDING_DATE = new Date("2026-12-12T08:00:00.000Z");

const sections: { type: SectionType; sortOrder: number }[] = [
  { type: SectionType.HERO, sortOrder: 0 },
  { type: SectionType.COUNTDOWN, sortOrder: 1 },
  { type: SectionType.STORY, sortOrder: 2 },
  { type: SectionType.EVENTS, sortOrder: 3 },
  { type: SectionType.ENTOURAGE, sortOrder: 4 },
  { type: SectionType.DRESS_CODE, sortOrder: 5 },
  { type: SectionType.GALLERY, sortOrder: 6 },
  { type: SectionType.RSVP, sortOrder: 7 },
  { type: SectionType.GIFTS, sortOrder: 8 },
  { type: SectionType.FAQ, sortOrder: 9 },
];

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (existing) {
    return existing;
  }

  await auth.api.signUpEmail({
    body: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: DEMO_NAME,
    },
  });

  const created = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!created) {
    throw new Error("Demo user was not created.");
  }

  return created;
}

async function main() {
  const user = await ensureDemoUser();

  const wedding = await prisma.wedding.upsert({
    where: { slug: WEDDING_SLUG },
    update: {
      partnerOneName: "Kent",
      partnerTwoName: "Maria",
      weddingDate: WEDDING_DATE,
      timezone: "Asia/Manila",
      location: "Bawbawon Beach Resort, Misamis Occidental",
      description:
        "Kent and Maria invite you to celebrate their wedding by the beach.",
      themeId: "rustic",
      status: WeddingStatus.PUBLISHED,
    },
    create: {
      publicId: WEDDING_PUBLIC_ID,
      slug: WEDDING_SLUG,
      partnerOneName: "Kent",
      partnerTwoName: "Maria",
      weddingDate: WEDDING_DATE,
      timezone: "Asia/Manila",
      location: "Bawbawon Beach Resort, Misamis Occidental",
      description:
        "Kent and Maria invite you to celebrate their wedding by the beach.",
      themeId: "rustic",
      status: WeddingStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.weddingMember.upsert({
      where: {
        weddingId_userId: {
          weddingId: wedding.id,
          userId: user.id,
        },
      },
      update: { role: WeddingMemberRole.OWNER },
      create: {
        weddingId: wedding.id,
        userId: user.id,
        role: WeddingMemberRole.OWNER,
      },
    });

    await tx.themeSettings.upsert({
      where: { weddingId: wedding.id },
      update: {
        primaryColor: "#B86F52",
        secondaryColor: "#87957A",
        backgroundColor: "#F7F1E8",
        textColor: "#332D29",
        accentColor: "#6F5141",
        headingFont: "Libre Baskerville",
        bodyFont: "Source Serif 4",
        scriptFont: "Great Vibes",
        customConfigJson: {
          envelopeStyle: "kraft",
          sealInitials: "K&M",
          musicEnabled: false,
        },
      },
      create: {
        weddingId: wedding.id,
        primaryColor: "#B86F52",
        secondaryColor: "#87957A",
        backgroundColor: "#F7F1E8",
        textColor: "#332D29",
        accentColor: "#6F5141",
        headingFont: "Libre Baskerville",
        bodyFont: "Source Serif 4",
        scriptFont: "Great Vibes",
        customConfigJson: {
          envelopeStyle: "kraft",
          sealInitials: "K&M",
          musicEnabled: false,
        },
      },
    });

    await tx.weddingSection.deleteMany({ where: { weddingId: wedding.id } });
    await tx.event.deleteMany({ where: { weddingId: wedding.id } });
    await tx.galleryItem.deleteMany({ where: { weddingId: wedding.id } });
    await tx.faqItem.deleteMany({ where: { weddingId: wedding.id } });
    await tx.giftAccount.deleteMany({ where: { weddingId: wedding.id } });
    await tx.storyItem.deleteMany({ where: { weddingId: wedding.id } });
    await tx.guestParty.deleteMany({ where: { weddingId: wedding.id } });
    await tx.guestGroup.deleteMany({ where: { weddingId: wedding.id } });

    await tx.weddingSection.createMany({
      data: sections.map((section) => ({
        weddingId: wedding.id,
        type: section.type,
        enabled: true,
        sortOrder: section.sortOrder,
      })),
    });

    await tx.event.createMany({
      data: [
        {
          weddingId: wedding.id,
          name: "Ceremony",
          description: "The wedding ceremony.",
          startAt: new Date("2026-12-12T08:00:00.000Z"),
          endAt: new Date("2026-12-12T09:00:00.000Z"),
          venueName: "Bawbawon Beach Resort",
          address: "Misamis Occidental",
          mapUrl:
            "https://www.google.com/maps/search/?api=1&query=Bawbawon+Beach+Resort",
          dressCode: "Garden Formal",
          sortOrder: 0,
        },
        {
          weddingId: wedding.id,
          name: "Reception",
          description: "Dinner and dancing after the ceremony.",
          startAt: new Date("2026-12-12T10:00:00.000Z"),
          endAt: new Date("2026-12-12T14:00:00.000Z"),
          venueName: "Bawbawon Beach Resort",
          address: "Misamis Occidental",
          mapUrl:
            "https://www.google.com/maps/search/?api=1&query=Bawbawon+Beach+Resort",
          dressCode: "Garden Formal",
          sortOrder: 1,
        },
      ],
    });

    const friends = await tx.guestGroup.create({
      data: { weddingId: wedding.id, name: "Friends" },
    });
    const brideFamily = await tx.guestGroup.create({
      data: { weddingId: wedding.id, name: "Bride Family" },
    });
    const groomFamily = await tx.guestGroup.create({
      data: { weddingId: wedding.id, name: "Groom Family" },
    });

    await tx.guestGroup.createMany({
      data: ["Work", "VIP", "Principal Sponsors", "Entourage"].map((name) => ({
        weddingId: wedding.id,
        name,
      })),
    });

    await tx.guestParty.create({
      data: {
        weddingId: wedding.id,
        guestGroupId: friends.id,
        name: "Santos Family",
        token: SANTOS_TOKEN,
        maxGuests: 2,
        guests: {
          create: [
            { firstName: "Juan", lastName: "Santos", primaryGuest: true },
            { firstName: "Sofia", lastName: "Santos" },
          ],
        },
      },
    });

    await tx.guestParty.create({
      data: {
        weddingId: wedding.id,
        guestGroupId: brideFamily.id,
        name: "Reyes Family",
        token: "R4K9WQ2M8P3L",
        maxGuests: 3,
        guests: {
          create: [
            { firstName: "Ana", lastName: "Reyes", primaryGuest: true },
            { firstName: "Luis", lastName: "Reyes" },
            { firstName: "Mateo", lastName: "Reyes" },
          ],
        },
      },
    });

    await tx.guestParty.create({
      data: {
        weddingId: wedding.id,
        guestGroupId: groomFamily.id,
        name: "Cruz Party",
        token: "C8N3PL6T5H2Y",
        maxGuests: 1,
        guests: {
          create: [
            { firstName: "Elena", lastName: "Cruz", primaryGuest: true },
          ],
        },
      },
    });

    await tx.galleryItem.createMany({
      data: [1, 2, 3, 4, 5].map((index) => ({
        weddingId: wedding.id,
        imageUrl: `/demo/gallery-${index}.svg`,
        caption: `Kent and Maria, photo ${index}`,
        sortOrder: index - 1,
      })),
    });

    await tx.storyItem.createMany({
      data: [
        {
          weddingId: wedding.id,
          title: "We Met",
          date: "2019",
          description: "A rainy afternoon and a shared table.",
          sortOrder: 0,
        },
        {
          weddingId: wedding.id,
          title: "Our First Trip",
          date: "2021",
          description: "The week we knew this was home.",
          sortOrder: 1,
        },
        {
          weddingId: wedding.id,
          title: "She Said Yes",
          date: "2025",
          description: "A quiet yes by the water.",
          sortOrder: 2,
        },
        {
          weddingId: wedding.id,
          title: "We're Getting Married",
          date: "2026",
          description: "December at Bawbawon Beach Resort.",
          sortOrder: 3,
        },
      ],
    });

    await tx.faqItem.createMany({
      data: [
        {
          weddingId: wedding.id,
          question: "Where can guests park?",
          answer: "The resort has a lot beside the entrance. Please leave the front drive clear for the ceremony.",
          sortOrder: 0,
        },
        {
          weddingId: wedding.id,
          question: "Are children welcome?",
          answer: "Yes. Let us know how many little ones are coming when you reply.",
          sortOrder: 1,
        },
      ],
    });

    await tx.giftAccount.create({
      data: {
        weddingId: wedding.id,
        type: GiftType.QRPH,
        displayName: "QR Ph",
        accountName: "Demo Account",
        institutionName: "Sample Bank",
        maskedAccountNumber: "****0000",
        description:
          "Placeholder only. This is not a real payment account and is disabled.",
        sortOrder: 0,
        isEnabled: false,
      },
    });
  });

  const [parties, guests, events, gallery, gifts, groups, faqs] = await Promise.all([
    prisma.guestParty.count({ where: { weddingId: wedding.id } }),
    prisma.guest.count({ where: { guestParty: { weddingId: wedding.id } } }),
    prisma.event.count({ where: { weddingId: wedding.id } }),
    prisma.galleryItem.count({ where: { weddingId: wedding.id } }),
    prisma.giftAccount.count({ where: { weddingId: wedding.id } }),
    prisma.guestGroup.count({ where: { weddingId: wedding.id } }),
    prisma.faqItem.count({ where: { weddingId: wedding.id } }),
  ]);

  if (
    parties !== 3 ||
    guests !== 6 ||
    events !== 2 ||
    gallery !== 5 ||
    gifts !== 1 ||
    groups !== 7 ||
    faqs !== 2
  ) {
    throw new Error(
      `Seed counts were unexpected: parties=${parties}, guests=${guests}, events=${events}, gallery=${gallery}, gifts=${gifts}, groups=${groups}, faqs=${faqs}`,
    );
  }

  console.log("Demo wedding seeded.");
  console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Invitation token: ${SANTOS_TOKEN}`);
  console.log(`Public slug: ${WEDDING_SLUG}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
