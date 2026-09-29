export const GUEST_FILTERS = [
  { id: "all", label: "All" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "pending", label: "Pending" },
  { id: "opened", label: "Opened" },
  { id: "not-opened", label: "Not opened" },
] as const;

export type GuestFilter = (typeof GUEST_FILTERS)[number]["id"];

export function isGuestFilter(value: string | undefined): value is GuestFilter {
  return GUEST_FILTERS.some((filter) => filter.id === value);
}

type FilterableParty = {
  name: string;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  inviteStatus: "NOT_SENT" | "SENT" | "OPENED";
  guests: { name: string }[];
};

export function matchesGuestFilter(party: FilterableParty, filter: GuestFilter) {
  switch (filter) {
    case "all":
      return true;
    case "accepted":
      return party.rsvpStatus === "ACCEPTED";
    case "declined":
      return party.rsvpStatus === "DECLINED";
    case "pending":
      return party.rsvpStatus === "PENDING";
    case "opened":
      return party.inviteStatus === "OPENED";
    case "not-opened":
      return party.inviteStatus !== "OPENED";
    default:
      return true;
  }
}

export function matchesGuestQuery(party: FilterableParty, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  if (party.name.toLowerCase().includes(needle)) {
    return true;
  }
  return party.guests.some((guest) => guest.name.toLowerCase().includes(needle));
}

export function guestListHref(filter: GuestFilter, query: string, edit?: string) {
  const params = new URLSearchParams();
  if (filter !== "all") {
    params.set("filter", filter);
  }
  if (query.trim()) {
    params.set("q", query.trim());
  }
  if (edit) {
    params.set("edit", edit);
  }
  const search = params.toString();
  return search ? `/dashboard/guests?${search}` : "/dashboard/guests";
}

export const RSVP_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
} as const;

export const INVITE_LABELS = {
  NOT_SENT: "Not sent",
  SENT: "Sent",
  OPENED: "Opened",
} as const;
