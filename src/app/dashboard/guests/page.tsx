import { GuestGroups } from "@/components/wedding/guest-groups";
import { GuestManager } from "@/components/wedding/guest-manager";
import { GuestTable, type GuestTableRow } from "@/components/wedding/guest-table";
import { NoWedding } from "@/components/wedding/no-wedding";
import { env } from "@/lib/env";
import { formatEventWhen } from "@/lib/weddings/datetime";
import { isGuestFilter, matchesGuestFilter, matchesGuestQuery } from "@/lib/weddings/guest-filters";
import { loadActiveWorkspace } from "@/lib/weddings/queries";

type Workspace = NonNullable<Awaited<ReturnType<typeof loadActiveWorkspace>>>;
type Party = Workspace["wedding"]["guestParties"][number];

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; edit?: string }>;
}) {
  const workspace = await loadActiveWorkspace();
  if (!workspace) {
    return <NoWedding title="Guests" />;
  }

  const query = await searchParams;
  const filter = isGuestFilter(query.filter) ? query.filter : "all";
  const search = query.q?.trim() ?? "";
  const { wedding } = workspace;
  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const rows = wedding.guestParties.map((party) => toRow(party, origin, wedding.timezone));
  const visible = rows.filter(
    (row) =>
      matchesGuestFilter(row, filter) &&
      matchesGuestQuery(
        { ...row, guests: row.guests.map((guest) => ({ name: guest.name })) },
        search,
      ),
  );
  const editing = rows.find((row) => row.id === query.edit) ?? null;
  const accepted = rows.filter((row) => row.rsvpStatus === "ACCEPTED").length;
  const declined = rows.filter((row) => row.rsvpStatus === "DECLINED").length;
  const pending = rows.filter((row) => row.rsvpStatus === "PENDING").length;
  const attendees = rows.reduce((sum, row) => sum + row.attendeeCount, 0);
  const guestCount = rows.reduce((sum, row) => sum + row.guests.length, 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guests</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Each party has one private invitation link. Guests do not need accounts.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Guests" value={guestCount} />
        <Stat label="Accepted" value={accepted} />
        <Stat label="Declined" value={declined} />
        <Stat label="Pending" value={pending} />
        <Stat label="Attendees" value={attendees} />
      </dl>
      <GuestTable
        weddingId={wedding.id}
        rows={visible}
        groups={wedding.guestGroups.map((group) => ({ id: group.id, name: group.name }))}
        filter={filter}
        query={search}
        editing={editing}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <GuestGroups
          weddingId={wedding.id}
          groups={wedding.guestGroups.map((group) => ({
            id: group.id,
            name: group.name,
            partyCount: wedding.guestParties.filter((party) => party.guestGroupId === group.id).length,
          }))}
        />
        <GuestManager
          weddingId={wedding.id}
          groups={wedding.guestGroups.map((group) => ({ id: group.id, name: group.name }))}
          parties={[]}
          formsOnly
          formKey={rows.length}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background rounded-xl px-3 py-3 ring-1 ring-foreground/10">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function toRow(party: Party, origin: string, timeZone: string): GuestTableRow {
  return {
    id: party.id,
    name: party.name,
    maxGuests: party.maxGuests,
    groupId: party.guestGroupId,
    groupName: party.guestGroup?.name ?? null,
    inviteUrl: `${origin}/i/${party.token}`,
    rsvpStatus: party.rsvpStatus,
    inviteStatus: party.inviteStatus,
    attendeeCount: party.rsvp?.attendeeCount ?? 0,
    lastViewedLabel: party.lastViewedAt ? formatEventWhen(party.lastViewedAt, timeZone) : "—",
    guests: party.guests.map((guest) => ({
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
    })),
  };
}
