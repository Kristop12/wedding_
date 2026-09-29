"use client";

import { useActionState, useState } from "react";
import {
  createGuestPartyAction,
  deleteGuestPartyAction,
  importGuestsAction,
} from "@/app/dashboard/weddings/actions";
import { CopyLinkButton } from "@/components/wedding/copy-link-button";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

export type GuestPartyItem = {
  id: string;
  name: string;
  maxGuests: number;
  groupName: string | null;
  token: string;
  inviteUrl: string;
  guests: { id: string; name: string; primaryGuest: boolean }[];
};

export function GuestManager({
  weddingId,
  parties,
  groups,
  formsOnly = false,
  formKey,
}: {
  weddingId: string;
  parties: GuestPartyItem[];
  groups: { id: string; name: string }[];
  formsOnly?: boolean;
  formKey?: number;
}) {
  const [importState, importAction] = useActionState(importGuestsAction, null);
  const forms = (
    <div className="space-y-4">
      <NewPartyForm key={formKey ?? parties.length} weddingId={weddingId} groups={groups} />
      <form action={importAction} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
        <h2 className="font-medium">Import CSV</h2>
        <p className="text-muted-foreground text-xs">
          Columns: party, maxGuests, group, firstName, lastName, email, phone. One row per guest.
          Guests with the same party name are grouped together.
        </p>
        <input type="hidden" name="weddingId" value={weddingId} />
        <input name="file" type="file" accept=".csv,text/csv" required className="text-sm" />
        <FormMessage state={importState} />
        <SubmitButton pendingLabel="Importing...">Import guests</SubmitButton>
      </form>
    </div>
  );

  if (formsOnly) {
    return forms;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-3">
        {parties.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No guest parties yet. Add a family or import a CSV.
          </p>
        ) : (
          parties.map((party) => (
            <article key={party.id} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{party.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {party.guests.length} of {party.maxGuests} seats
                    {party.groupName ? ` · ${party.groupName}` : ""}
                  </p>
                </div>
                <form action={deleteGuestPartyAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="partyId" value={party.id} />
                  <SubmitButton variant="destructive" pendingLabel="Removing...">
                    Remove
                  </SubmitButton>
                </form>
              </div>
              <ul className="text-sm">
                {party.guests.map((guest) => (
                  <li key={guest.id}>
                    {guest.name}
                    {guest.primaryGuest ? " · primary" : ""}
                  </li>
                ))}
              </ul>
              <CopyLinkButton value={party.inviteUrl} label="Copy invitation link" />
            </article>
          ))
        )}
      </div>
      {forms}
    </div>
  );
}

function NewPartyForm({
  weddingId,
  groups,
}: {
  weddingId: string;
  groups: { id: string; name: string }[];
}) {
  const [memberCount, setMemberCount] = useState(1);
  const [createState, createAction] = useActionState(createGuestPartyAction, null);

  return (
    <form action={createAction} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
      <h2 className="font-medium">Add a guest party</h2>
      <input type="hidden" name="weddingId" value={weddingId} />
      <Field label="Party name" htmlFor="party-name">
        <input id="party-name" name="name" className={controlClassName} placeholder="Santos Family" required />
      </Field>
      <Field label="Allowed seats" htmlFor="max-guests">
        <input
          id="max-guests"
          name="maxGuests"
          type="number"
          min={1}
          max={20}
          defaultValue={2}
          className={controlClassName}
          required
        />
      </Field>
      <Field label="Group" htmlFor="group-id">
        <select id="group-id" name="groupId" className={controlClassName} defaultValue="">
          <option value="">No group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Or a new group" htmlFor="new-group">
        <input id="new-group" name="newGroupName" className={controlClassName} />
      </Field>
      <div className="space-y-3">
        {Array.from({ length: memberCount }, (_, index) => (
          <fieldset key={index} className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-medium">
              Guest {index + 1}
              {index === 0 ? " · primary" : ""}
            </legend>
            <input
              name="memberFirstName"
              className={controlClassName}
              placeholder="First name"
              required
              aria-label={`Guest ${index + 1} first name`}
            />
            <input
              name="memberLastName"
              className={controlClassName}
              placeholder="Last name"
              required
              aria-label={`Guest ${index + 1} last name`}
            />
            <input
              name="memberEmail"
              type="email"
              className={controlClassName}
              placeholder="Email"
              aria-label={`Guest ${index + 1} email`}
            />
            <input
              name="memberPhone"
              className={controlClassName}
              placeholder="Phone"
              aria-label={`Guest ${index + 1} phone`}
            />
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        className="text-sm underline-offset-4 hover:underline"
        onClick={() => setMemberCount((count) => Math.min(count + 1, 20))}
      >
        Add another guest
      </button>
      <FormMessage state={createState} />
      <SubmitButton pendingLabel="Adding...">Add party</SubmitButton>
    </form>
  );
}
