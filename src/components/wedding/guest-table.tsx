import Link from "next/link";
import {
  deleteGuestPartyAction,
  markInvitationSentAction,
} from "@/app/dashboard/weddings/actions";
import { CopyLinkButton } from "@/components/wedding/copy-link-button";
import { GuestEditor } from "@/components/wedding/guest-editor";
import { SubmitButton } from "@/components/wedding/submit-button";
import {
  GUEST_FILTERS,
  INVITE_LABELS,
  RSVP_LABELS,
  guestListHref,
  type GuestFilter,
} from "@/lib/weddings/guest-filters";
import { cn } from "@/lib/utils";

export type GuestTableRow = {
  id: string;
  name: string;
  maxGuests: number;
  groupId: string | null;
  groupName: string | null;
  inviteUrl: string;
  rsvpStatus: keyof typeof RSVP_LABELS;
  inviteStatus: keyof typeof INVITE_LABELS;
  attendeeCount: number;
  lastViewedLabel: string;
  guests: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }[];
};

export function GuestTable({
  weddingId,
  rows,
  groups,
  filter,
  query,
  editing,
}: {
  weddingId: string;
  rows: GuestTableRow[];
  groups: { id: string; name: string }[];
  filter: GuestFilter;
  query: string;
  editing: GuestTableRow | null;
}) {
  const closeHref = guestListHref(filter, query);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Guest filters" className="flex flex-wrap gap-2">
          {GUEST_FILTERS.map((item) => {
            const active = item.id === filter;
            return (
              <Link
                key={item.id}
                href={guestListHref(item.id, query)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1 text-sm ring-1",
                  active ? "bg-foreground text-background ring-foreground" : "ring-foreground/15",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action="/dashboard/guests" className="flex gap-2">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <label className="sr-only" htmlFor="guest-search">
            Search guests
          </label>
          <input
            id="guest-search"
            name="q"
            defaultValue={query}
            placeholder="Search parties or guests"
            className="border-input bg-background h-9 w-full rounded-lg border px-2.5 text-sm sm:w-64"
          />
          <button type="submit" className="text-sm underline">
            Search
          </button>
        </form>
      </div>

      {editing ? (
        <GuestEditor
          key={`${editing.id}-${editing.guests.map((guest) => guest.id).join("-")}`}
          weddingId={weddingId}
          partyId={editing.id}
          name={editing.name}
          maxGuests={editing.maxGuests}
          groupId={editing.groupId}
          groups={groups}
          guests={editing.guests}
          closeHref={closeHref}
        />
      ) : null}

      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Party</th>
              <th className="px-3 py-2 font-medium">Guests</th>
              <th className="px-3 py-2 font-medium">Allowed seats</th>
              <th className="px-3 py-2 font-medium">RSVP</th>
              <th className="px-3 py-2 font-medium">Attendees</th>
              <th className="px-3 py-2 font-medium">Invitation</th>
              <th className="px-3 py-2 font-medium">Last viewed</th>
              <th className="px-3 py-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground px-3 py-6">
                  No parties match this view.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium">{row.name}</div>
                    {row.groupName ? <div className="text-muted-foreground text-xs">{row.groupName}</div> : null}
                  </td>
                  <td className="px-3 py-3">
                    {row.guests.map((guest) => guest.name).join(", ")}
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {row.guests.length} / {row.maxGuests}
                  </td>
                  <td className="px-3 py-3">{RSVP_LABELS[row.rsvpStatus]}</td>
                  <td className="px-3 py-3 tabular-nums">{row.attendeeCount}</td>
                  <td className="px-3 py-3">
                    <div>{INVITE_LABELS[row.inviteStatus]}</div>
                    {row.inviteStatus === "NOT_SENT" ? (
                      <form action={markInvitationSentAction} className="mt-2">
                        <input type="hidden" name="weddingId" value={weddingId} />
                        <input type="hidden" name="partyId" value={row.id} />
                        <SubmitButton variant="outline" pendingLabel="Saving...">
                          Mark sent
                        </SubmitButton>
                      </form>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">{row.lastViewedLabel}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <CopyLinkButton value={row.inviteUrl} label="Copy link" />
                      <Link href={guestListHref(filter, query, row.id)} className="text-sm underline">
                        Edit
                      </Link>
                      <form action={deleteGuestPartyAction}>
                        <input type="hidden" name="weddingId" value={weddingId} />
                        <input type="hidden" name="partyId" value={row.id} />
                        <SubmitButton variant="destructive" pendingLabel="Removing...">
                          Remove
                        </SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
