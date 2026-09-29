import Link from "next/link";
import { CoupleForm } from "@/components/wedding/couple-form";
import { DetailsForm } from "@/components/wedding/details-form";
import { EventManager, type EventItem } from "@/components/wedding/event-manager";
import { GuestManager, type GuestPartyItem } from "@/components/wedding/guest-manager";
import { PublishPanel } from "@/components/wedding/publish-panel";
import { ThemePicker } from "@/components/wedding/theme-picker";
import { WizardFrame } from "@/components/wedding/wizard-frame";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/lib/env";
import { formatDateInput, formatDateTimeLocal, formatEventWhen } from "@/lib/weddings/datetime";
import { isWizardStep, WEDDING_THEMES } from "@/lib/weddings/constants";
import { loadWorkspace } from "@/lib/weddings/queries";
import { getThemeConfig } from "@/themes/registry";
import { cn } from "@/lib/utils";

const themeSwatches = Object.fromEntries(
  WEDDING_THEMES.map((theme) => {
    const config = getThemeConfig(theme.id);
    return [
      theme.id,
      {
        background: config.colors.background,
        primary: config.colors.primary,
        accent: config.colors.accent,
        text: config.colors.text,
      },
    ];
  }),
);

export default async function WeddingSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { weddingId } = await params;
  const query = await searchParams;
  const step = isWizardStep(query.step) ? query.step : "couple";
  const { wedding } = await loadWorkspace(weddingId);
  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const setup = (nextStep: string) => `/dashboard/weddings/${wedding.id}/setup?step=${nextStep}`;

  return (
    <WizardFrame weddingId={wedding.id} step={step}>
      {step === "couple" ? (
        <CoupleForm
          weddingId={wedding.id}
          defaults={{
            partnerOneName: wedding.partnerOneName,
            partnerTwoName: wedding.partnerTwoName,
            slug: wedding.slug,
          }}
          next={setup("wedding")}
          submitLabel="Save and continue"
        />
      ) : null}
      {step === "wedding" ? (
        <DetailsForm
          weddingId={wedding.id}
          defaults={{
            weddingDate: wedding.weddingDate
              ? formatDateInput(wedding.weddingDate, wedding.timezone)
              : "",
            timezone: wedding.timezone,
            location: wedding.location ?? "",
            description: wedding.description ?? "",
          }}
          next={setup("theme")}
          submitLabel="Save and continue"
        />
      ) : null}
      {step === "theme" ? (
        <ThemePicker
          weddingId={wedding.id}
          themeId={wedding.themeId}
          next={setup("events")}
          swatches={themeSwatches}
          submitLabel="Save and continue"
        />
      ) : null}
      {step === "events" ? (
        <div className="space-y-4">
          <EventManager weddingId={wedding.id} events={toEvents(wedding)} />
          <Link href={setup("guests")} className={cn(buttonVariants({ variant: "outline" }))}>
            Continue to guests
          </Link>
        </div>
      ) : null}
      {step === "guests" ? (
        <div className="space-y-4">
          <GuestManager
            weddingId={wedding.id}
            groups={wedding.guestGroups.map((group) => ({ id: group.id, name: group.name }))}
            parties={toParties(wedding, origin)}
          />
          <Link href={setup("publish")} className={cn(buttonVariants({ variant: "outline" }))}>
            Continue to publish
          </Link>
        </div>
      ) : null}
      {step === "publish" ? (
        <PublishPanel
          weddingId={wedding.id}
          status={wedding.status}
          publicUrl={`${origin}/w/${wedding.slug}`}
          hasDate={Boolean(wedding.weddingDate)}
          eventCount={wedding.events.length}
          partyCount={wedding.guestParties.length}
          parties={wedding.guestParties.map((party) => ({
            name: party.name,
            url: `${origin}/i/${party.token}`,
          }))}
        />
      ) : null}
    </WizardFrame>
  );
}

function toEvents(wedding: Awaited<ReturnType<typeof loadWorkspace>>["wedding"]): EventItem[] {
  return wedding.events.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description ?? "",
    startAt: formatDateTimeLocal(event.startAt, wedding.timezone),
    endAt: event.endAt ? formatDateTimeLocal(event.endAt, wedding.timezone) : "",
    venueName: event.venueName ?? "",
    address: event.address ?? "",
    mapUrl: event.mapUrl ?? "",
    dressCode: event.dressCode ?? "",
    whenLabel: formatEventWhen(event.startAt, wedding.timezone),
  }));
}

function toParties(
  wedding: Awaited<ReturnType<typeof loadWorkspace>>["wedding"],
  origin: string,
): GuestPartyItem[] {
  return wedding.guestParties.map((party) => ({
    id: party.id,
    name: party.name,
    maxGuests: party.maxGuests,
    groupName: party.guestGroup?.name ?? null,
    token: party.token,
    inviteUrl: `${origin}/i/${party.token}`,
    guests: party.guests.map((guest) => ({
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`,
      primaryGuest: guest.primaryGuest,
    })),
  }));
}
