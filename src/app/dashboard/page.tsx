import Link from "next/link";
import { selectWeddingAction } from "@/app/dashboard/weddings/actions";
import { CopyLinkButton } from "@/components/wedding/copy-link-button";
import { controlClassName } from "@/components/wedding/field";
import { NoWedding } from "@/components/wedding/no-wedding";
import { SubmitButton } from "@/components/wedding/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { daysUntil, formatLongDate } from "@/lib/weddings/datetime";
import { listWeddingsForCurrentUser, loadActiveWorkspace } from "@/lib/weddings/queries";
import { getWeddingSummary } from "@/lib/weddings/service";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

function nextStep(input: {
  weddingDate: Date | null;
  eventCount: number;
  partyCount: number;
  status: string;
}) {
  if (!input.weddingDate) return "wedding";
  if (input.eventCount === 0) return "events";
  if (input.partyCount === 0) return "guests";
  if (input.status !== "PUBLISHED") return "publish";
  return "couple";
}

export default async function DashboardPage() {
  const workspace = await loadActiveWorkspace();
  if (!workspace) {
    return <NoWedding title="Dashboard" />;
  }

  const { wedding } = workspace;
  const [summary, weddings] = await Promise.all([
    getWeddingSummary(wedding.id),
    listWeddingsForCurrentUser(),
  ]);
  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const remaining = wedding.weddingDate ? daysUntil(wedding.weddingDate, wedding.timezone) : null;
  const step = nextStep({
    weddingDate: wedding.weddingDate,
    eventCount: wedding.events.length,
    partyCount: wedding.guestParties.length,
    status: wedding.status,
  });
  const firstParty = wedding.guestParties[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {wedding.partnerOneName} & {wedding.partnerTwoName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {wedding.status === "PUBLISHED" ? "Published" : "Draft"}
            {wedding.weddingDate
              ? ` · ${formatLongDate(wedding.weddingDate, wedding.timezone)}`
              : " · Date not set"}
          </p>
        </div>
        <Link
          href={`/dashboard/weddings/${wedding.id}/setup?step=${step}`}
          className={cn(buttonVariants())}
        >
          {wedding.status === "PUBLISHED" ? "Edit setup" : "Continue setup"}
        </Link>
      </div>

      {weddings.length > 1 ? (
        <form action={selectWeddingAction} className="flex max-w-md items-center gap-2">
          <label className="sr-only" htmlFor="wedding-switcher">
            Wedding
          </label>
          <select id="wedding-switcher" name="weddingId" defaultValue={wedding.id} className={controlClassName}>
            {weddings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.partnerOneName} & {item.partnerTwoName}
              </option>
            ))}
          </select>
          <SubmitButton variant="outline" pendingLabel="Switching...">
            Switch
          </SubmitButton>
        </form>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Days remaining"
          value={
            remaining === null ? "—" : remaining > 0 ? String(remaining) : remaining === 0 ? "Today" : "Passed"
          }
        />
        <Stat label="Guests listed" value={String(summary.guestCount)} />
        <Stat label="Accepted parties" value={String(summary.accepted)} />
        <Stat label="Pending parties" value={String(summary.pending)} />
        <Stat label="Invitations sent" value={String(summary.invitationsSent)} />
        <Stat label="Invitations opened" value={String(summary.invitationsOpened)} />
        <Stat label="Open rate" value={summary.openRate === null ? "—" : `${summary.openRate}%`} />
        <Stat label="RSVP completion" value={summary.rsvpCompletion === null ? "—" : `${summary.rsvpCompletion}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-background ring-foreground/10 space-y-3 rounded-xl p-5 ring-1">
          <h2 className="font-medium">Quick actions</h2>
          <div className="flex flex-col items-start gap-2">
            <Link href="/dashboard/guests" className="text-sm underline-offset-4 hover:underline">
              Add guest
            </Link>
            <Link href="/dashboard/events" className="text-sm underline-offset-4 hover:underline">
              Add event
            </Link>
            <Link href="/dashboard/gallery" className="text-sm underline-offset-4 hover:underline">
              Upload photo
            </Link>
            <Link href="/dashboard/gifts" className="text-sm underline-offset-4 hover:underline">
              Manage gifts
            </Link>
          </div>
          <CopyLinkButton value={`${origin}/w/${wedding.slug}`} label="Copy public link" />
          {firstParty ? (
            <CopyLinkButton
              value={`${origin}/i/${firstParty.token}`}
              label="Copy invitation link"
            />
          ) : null}
        </div>
        <div className="bg-background ring-foreground/10 space-y-3 rounded-xl p-5 ring-1">
          <h2 className="font-medium">Recent RSVPs</h2>
          {summary.recent.length === 0 ? (
            <p className="text-muted-foreground text-sm">No RSVPs yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {summary.recent.map((party) => (
                <li key={party.id}>
                  {party.name} · {party.rsvpStatus.toLowerCase()}
                  {party.rsvp ? ` · ${party.rsvp.attendeeCount} attending` : ""}
                </li>
              ))}
            </ul>
          )}
          <p className="text-muted-foreground text-xs">
            {summary.declined} declined · {summary.attendeeCount} attendees confirmed
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
