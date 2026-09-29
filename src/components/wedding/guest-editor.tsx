"use client";

import { useActionState, useState } from "react";
import { updateGuestPartyAction } from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

export type EditableGuest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function GuestEditor({
  weddingId,
  partyId,
  name,
  maxGuests,
  groupId,
  groups,
  guests,
  closeHref,
}: {
  weddingId: string;
  partyId: string;
  name: string;
  maxGuests: number;
  groupId: string | null;
  groups: { id: string; name: string }[];
  guests: EditableGuest[];
  closeHref: string;
}) {
  const [members, setMembers] = useState(guests);
  const [state, action] = useActionState(updateGuestPartyAction, null);

  return (
    <form action={action} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">Edit {name}</h2>
        <a href={closeHref} className="text-sm underline">
          Close
        </a>
      </div>
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="partyId" value={partyId} />
      <input type="hidden" name="next" value={closeHref} />
      <Field label="Party name" htmlFor="edit-party-name" error={state?.fieldErrors?.name}>
        <input id="edit-party-name" name="name" defaultValue={name} className={controlClassName} required />
      </Field>
      <Field label="Allowed seats" htmlFor="edit-max-guests" error={state?.fieldErrors?.maxGuests}>
        <input
          id="edit-max-guests"
          name="maxGuests"
          type="number"
          min={1}
          max={20}
          defaultValue={maxGuests}
          className={controlClassName}
          required
        />
      </Field>
      <Field label="Group" htmlFor="edit-group-id">
        <select id="edit-group-id" name="groupId" className={controlClassName} defaultValue={groupId ?? ""}>
          <option value="">No group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Or a new group" htmlFor="edit-new-group">
        <input id="edit-new-group" name="newGroupName" className={controlClassName} />
      </Field>
      <div className="space-y-3">
        {members.map((member, index) => (
          <fieldset key={member.id} className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-medium">
              Guest {index + 1}
              {index === 0 ? " · primary" : ""}
            </legend>
            <input
              name="memberFirstName"
              defaultValue={member.firstName}
              className={controlClassName}
              placeholder="First name"
              required
              aria-label={`Guest ${index + 1} first name`}
            />
            <input
              name="memberLastName"
              defaultValue={member.lastName}
              className={controlClassName}
              placeholder="Last name"
              required
              aria-label={`Guest ${index + 1} last name`}
            />
            <input
              name="memberEmail"
              type="email"
              defaultValue={member.email}
              className={controlClassName}
              placeholder="Email"
              aria-label={`Guest ${index + 1} email`}
            />
            <input
              name="memberPhone"
              defaultValue={member.phone}
              className={controlClassName}
              placeholder="Phone"
              aria-label={`Guest ${index + 1} phone`}
            />
            {members.length > 1 ? (
              <button
                type="button"
                className="text-sm underline"
                onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}
              >
                Remove guest
              </button>
            ) : null}
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        className="text-sm underline"
        onClick={() =>
          setMembers((current) => [
            ...current,
            { id: `new-${current.length}`, firstName: "", lastName: "", email: "", phone: "" },
          ])
        }
      >
        Add another guest
      </button>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Saving...">Save party</SubmitButton>
    </form>
  );
}
