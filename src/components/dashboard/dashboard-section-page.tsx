import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

const sections = {
  wedding: {
    title: "Wedding",
    description: "Partner names, date, location, and publishing.",
  },
  theme: {
    title: "Theme",
    description: "Theme selection and color, type, and music settings.",
  },
  guests: {
    title: "Guests",
    description: "Guest parties, groups, and invitation links.",
  },
  rsvp: {
    title: "RSVP",
    description: "Accepted, declined, and pending responses.",
  },
  events: {
    title: "Events",
    description: "Ceremony, reception, and other wedding events.",
  },
  gallery: {
    title: "Gallery",
    description: "Photos shown on the wedding website.",
  },
  gifts: {
    title: "Gifts",
    description: "QR Ph, bank details, e-wallets, and registry links.",
  },
  settings: {
    title: "Settings",
    description: "Account and wedding preferences.",
  },
} as const;

export function DashboardSectionPage({
  section,
}: {
  section: keyof typeof sections;
}) {
  const content = sections[section];
  return (
    <SectionPlaceholder
      title={content.title}
      description={content.description}
    />
  );
}
