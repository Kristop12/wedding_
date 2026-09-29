"use client";

import { useActionState, useState } from "react";
import { deleteEventAction, saveEventAction } from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

export type EventItem = {
  id: string;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  venueName: string;
  address: string;
  mapUrl: string;
  dressCode: string;
  whenLabel: string;
};

const emptyEvent: EventItem = {
  id: "",
  name: "",
  description: "",
  startAt: "",
  endAt: "",
  venueName: "",
  address: "",
  mapUrl: "",
  dressCode: "",
  whenLabel: "",
};

export function EventManager({
  weddingId,
  events,
}: {
  weddingId: string;
  events: EventItem[];
}) {
  const [editing, setEditing] = useState<EventItem>(emptyEvent);
  const [state, action] = useActionState(saveEventAction, null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events yet. Add the ceremony and reception.</p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{event.name}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">{event.whenLabel}</p>
                  {event.venueName ? <p className="mt-1 text-sm">{event.venueName}</p> : null}
                  {event.address ? <p className="text-muted-foreground text-sm">{event.address}</p> : null}
                  {event.dressCode ? (
                    <p className="text-muted-foreground mt-1 text-sm">Dress code: {event.dressCode}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm underline-offset-4 hover:underline"
                    onClick={() => setEditing(event)}
                  >
                    Edit
                  </button>
                  <form action={deleteEventAction}>
                    <input type="hidden" name="weddingId" value={weddingId} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <SubmitButton variant="destructive" pendingLabel="Removing...">
                      Remove
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <form
        key={`${events.length}-${editing.id}`}
        action={action}
        className="bg-background ring-foreground/10 h-fit space-y-3 rounded-xl p-4 ring-1"
      >
        <h2 className="font-medium">{editing.id ? "Edit event" : "Add event"}</h2>
        <input type="hidden" name="weddingId" value={weddingId} />
        <input type="hidden" name="eventId" value={editing.id} />
        <Field label="Name" htmlFor="event-name">
          <input id="event-name" name="name" key={`${editing.id}-name`} defaultValue={editing.name} className={controlClassName} required />
        </Field>
        <Field label="Description" htmlFor="event-description">
          <textarea
            id="event-description"
            name="description"
            key={`${editing.id}-description`}
            defaultValue={editing.description}
            rows={3}
            className={`${controlClassName} h-auto py-2`}
          />
        </Field>
        <Field label="Starts" htmlFor="event-start">
          <input id="event-start" name="startAt" type="datetime-local" key={`${editing.id}-start`} defaultValue={editing.startAt} className={controlClassName} required />
        </Field>
        <Field label="Ends" htmlFor="event-end">
          <input id="event-end" name="endAt" type="datetime-local" key={`${editing.id}-end`} defaultValue={editing.endAt} className={controlClassName} />
        </Field>
        <Field label="Venue" htmlFor="event-venue">
          <input id="event-venue" name="venueName" key={`${editing.id}-venue`} defaultValue={editing.venueName} className={controlClassName} />
        </Field>
        <Field label="Address" htmlFor="event-address">
          <input id="event-address" name="address" key={`${editing.id}-address`} defaultValue={editing.address} className={controlClassName} />
        </Field>
        <Field label="Google Maps URL" htmlFor="event-map">
          <input id="event-map" name="mapUrl" type="url" key={`${editing.id}-map`} defaultValue={editing.mapUrl} className={controlClassName} />
        </Field>
        <Field label="Dress code" htmlFor="event-dress">
          <input id="event-dress" name="dressCode" key={`${editing.id}-dress`} defaultValue={editing.dressCode} className={controlClassName} />
        </Field>
        <FormMessage state={state} />
        <div className="flex gap-2">
          <SubmitButton>{editing.id ? "Save event" : "Add event"}</SubmitButton>
          {editing.id ? (
            <button type="button" className="text-sm underline-offset-4 hover:underline" onClick={() => setEditing(emptyEvent)}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
