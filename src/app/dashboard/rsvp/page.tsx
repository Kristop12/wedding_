import Link from "next/link";
import { NoWedding } from "@/components/wedding/no-wedding";
import { RSVP_LABELS } from "@/lib/weddings/guest-filters";
import { formatEventWhen } from "@/lib/weddings/datetime";
import { loadRsvpBoard } from "@/lib/weddings/queries";

export default async function RsvpPage() {
  const board = await loadRsvpBoard();
  if (!board) {
    return <NoWedding title="RSVP" />;
  }

  const { wedding, parties } = board;
  const accepted = parties.filter((party) => party.rsvpStatus === "ACCEPTED").length;
  const declined = parties.filter((party) => party.rsvpStatus === "DECLINED").length;
  const pending = parties.filter((party) => party.rsvpStatus === "PENDING").length;
  const attendees = parties.reduce((sum, party) => sum + (party.rsvp?.attendeeCount ?? 0), 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RSVP</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Replies from invitation links. Guest lists stay on the{" "}
          <Link href="/dashboard/guests" className="underline-offset-4 hover:underline">
            guests page
          </Link>
          .
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Invited" value={String(parties.length)} />
        <Stat label="Accepted" value={String(accepted)} />
        <Stat label="Declined" value={String(declined)} />
        <Stat label="Pending" value={String(pending)} />
        <Stat label="Total attendees" value={String(attendees)} />
      </div>
      {parties.length === 0 ? (
        <p className="text-muted-foreground text-sm">No guest parties yet.</p>
      ) : (
        <div className="bg-background ring-foreground/10 overflow-x-auto rounded-xl ring-1">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-muted-foreground border-b text-xs tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Party</th>
                <th className="px-4 py-3 font-medium">Guests</th>
                <th className="px-4 py-3 font-medium">RSVP</th>
                <th className="px-4 py-3 font-medium">Attendees</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party.id} className="border-b last:border-0 align-top">
                  <td className="px-4 py-3 font-medium">{party.name}</td>
                  <td className="px-4 py-3">
                    {party.guests.map((guest) => `${guest.firstName} ${guest.lastName}`).join(", ")}
                  </td>
                  <td className="px-4 py-3">{RSVP_LABELS[party.rsvpStatus]}</td>
                  <td className="px-4 py-3">
                    {party.rsvp?.attendees.length ? (
                      <ul className="space-y-1">
                        {party.rsvp.attendees.map((attendee) => (
                          <li key={attendee.id}>
                            {attendee.name}
                            {attendee.mealPreference ? ` · ${attendee.mealPreference}` : ""}
                            {attendee.dietaryRequirements ? ` · ${attendee.dietaryRequirements}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="tabular-nums">{party.rsvp?.attendeeCount ?? 0}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-pre-wrap">{party.rsvp?.message ?? ""}</td>
                  <td className="px-4 py-3">
                    {party.rsvpSubmittedAt
                      ? formatEventWhen(party.rsvpSubmittedAt, wedding.timezone)
                      : "Not yet"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
