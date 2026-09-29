import { EventManager } from "@/components/wedding/event-manager";
import { NoWedding } from "@/components/wedding/no-wedding";
import { formatDateTimeLocal, formatEventWhen } from "@/lib/weddings/datetime";
import { loadActiveWorkspace } from "@/lib/weddings/queries";

export default async function EventsPage() {
  const workspace = await loadActiveWorkspace();
  if (!workspace) {
    return <NoWedding title="Events" />;
  }

  const { wedding } = workspace;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ceremony, reception, and anything else on the wedding day.
        </p>
      </div>
      <EventManager
        weddingId={wedding.id}
        events={wedding.events.map((event) => ({
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
        }))}
      />
    </section>
  );
}
