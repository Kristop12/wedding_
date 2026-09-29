"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitRsvpAction } from "@/app/i/[token]/actions";

type Attendee = { name: string; meal: string; dietary: string };

export type InvitationReply = {
  token: string;
  maxGuests: number;
  guestNames: string[];
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  message: string;
  attendees: Attendee[];
};

export function RsvpForm({ reply }: { reply: InvitationReply }) {
  const [state, action] = useActionState(submitRsvpAction, null);
  const [status, setStatus] = useState<"ACCEPTED" | "DECLINED" | "">(
    reply.status === "PENDING" ? "" : reply.status,
  );
  const [count, setCount] = useState(() => initialCount(reply));
  const [attendees, setAttendees] = useState<Attendee[]>(() => initialAttendees(reply));
  const [offline, setOffline] = useState(false);

  function changeCount(next: number) {
    const bounded = Math.min(Math.max(next, 1), reply.maxGuests);
    setCount(bounded);
    setAttendees((current) => {
      const copy = current.slice(0, bounded);
      while (copy.length < bounded) {
        copy.push({ name: reply.guestNames[copy.length] ?? "", meal: "", dietary: "" });
      }
      return copy;
    });
  }

  return (
    <form
      action={action}
      className="space-y-5 text-left"
      onSubmit={(event) => {
        if (!navigator.onLine) {
          event.preventDefault();
          setOffline(true);
        }
      }}
    >
      <input type="hidden" name="token" value={reply.token} />
      <p className="text-center font-[family-name:var(--theme-heading)] text-lg">Will you be joining us?</p>
      {reply.status !== "PENDING" ? (
        <p className="text-center text-sm leading-6" role="status">
          You already sent a reply. You can update it.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice
          name="status"
          value="ACCEPTED"
          label="Joyfully Accept"
          checked={status === "ACCEPTED"}
          onChange={() => setStatus("ACCEPTED")}
        />
        <Choice
          name="status"
          value="DECLINED"
          label="Regretfully Decline"
          checked={status === "DECLINED"}
          onChange={() => setStatus("DECLINED")}
        />
      </div>
      {state?.fieldErrors?.status ? <p className="text-center text-sm">{state.fieldErrors.status}</p> : null}
      {status === "ACCEPTED" ? (
        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span>Number of Attendees</span>
            <select
              className={inputClassName}
              value={count}
              onChange={(event) => changeCount(Number(event.target.value))}
            >
              {Array.from({ length: reply.maxGuests }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {attendees.map((attendee, index) => (
            <fieldset
              key={index}
              className="space-y-3 px-4 py-4"
              style={{ backgroundColor: "var(--theme-bg)", borderRadius: "var(--theme-radius)" }}
            >
              <legend className="px-1 text-xs tracking-[0.16em] uppercase text-[var(--theme-accent)]">
                Guest {index + 1}
              </legend>
              <label className="block space-y-1.5 text-sm">
                <span>Guest name</span>
                <input
                  name="attendeeName"
                  value={attendee.name}
                  onChange={(event) => updateAttendee(setAttendees, index, { name: event.target.value })}
                  className={inputClassName}
                  autoComplete="name"
                />
              </label>
              {state?.fieldErrors?.[`attendees.${index}.name`] ? (
                <p className="text-sm">{state.fieldErrors[`attendees.${index}.name`]}</p>
              ) : null}
              <label className="block space-y-1.5 text-sm">
                <span>Meal preference</span>
                <input
                  name="attendeeMeal"
                  value={attendee.meal}
                  onChange={(event) => updateAttendee(setAttendees, index, { meal: event.target.value })}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span>Dietary requirements</span>
                <textarea
                  name="attendeeDietary"
                  value={attendee.dietary}
                  onChange={(event) => updateAttendee(setAttendees, index, { dietary: event.target.value })}
                  rows={2}
                  className={`${inputClassName} h-auto py-2`}
                />
              </label>
            </fieldset>
          ))}
          {state?.fieldErrors?.attendees ? <p className="text-sm">{state.fieldErrors.attendees}</p> : null}
        </div>
      ) : null}
      <label className="block space-y-1.5 text-sm">
        <span>Message for the couple</span>
        <textarea
          name="message"
          defaultValue={reply.message}
          rows={3}
          className={`${inputClassName} h-auto py-2`}
        />
      </label>
      {offline ? (
        <p className="text-center text-sm" role="status">
          Sending a reply needs an internet connection.
        </p>
      ) : null}
      {state?.message ? (
        <p className="text-center text-sm" role="status">
          {state.message}
        </p>
      ) : null}
      <div className="text-center">
        <ReplyButton />
      </div>
    </form>
  );
}

function Choice({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm"
      style={{
        backgroundColor: checked ? "var(--theme-bg)" : "transparent",
        borderRadius: "var(--theme-radius)",
        outline: "1px solid color-mix(in srgb, var(--theme-text) 18%, transparent)",
      }}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function ReplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 text-sm tracking-[0.14em] uppercase text-[var(--theme-surface)] disabled:opacity-60"
      style={{ backgroundColor: "var(--theme-primary)", borderRadius: "var(--theme-radius)" }}
    >
      {pending ? "Sending..." : "Send reply"}
    </button>
  );
}

const inputClassName =
  "h-10 w-full border border-[color-mix(in_srgb,var(--theme-text)_20%,transparent)] bg-[var(--theme-surface)] px-3 text-sm outline-none";

function initialCount(reply: InvitationReply) {
  if (reply.attendees.length > 0) {
    return Math.min(reply.attendees.length, reply.maxGuests);
  }
  return Math.min(Math.max(reply.guestNames.length, 1), reply.maxGuests);
}

function initialAttendees(reply: InvitationReply): Attendee[] {
  const count = initialCount(reply);
  if (reply.attendees.length > 0) {
    return reply.attendees.slice(0, count);
  }
  return Array.from({ length: count }, (_, index) => ({
    name: reply.guestNames[index] ?? "",
    meal: "",
    dietary: "",
  }));
}

function updateAttendee(
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>,
  index: number,
  patch: Partial<Attendee>,
) {
  setAttendees((current) => current.map((attendee, itemIndex) => (itemIndex === index ? { ...attendee, ...patch } : attendee)));
}
