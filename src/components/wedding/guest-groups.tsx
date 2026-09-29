"use client";

import { useActionState } from "react";
import { createGuestGroupAction, deleteGuestGroupAction } from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

export function GuestGroups({
  weddingId,
  groups,
}: {
  weddingId: string;
  groups: { id: string; name: string; partyCount: number }[];
}) {
  const [createState, createAction] = useActionState(createGuestGroupAction, null);

  return (
    <section className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
      <h2 className="font-medium">Groups</h2>
      <ul className="space-y-2 text-sm">
        {groups.map((group) => (
          <li key={group.id} className="flex items-center justify-between gap-3">
            <span>
              {group.name}
              <span className="text-muted-foreground"> · {group.partyCount}</span>
            </span>
            {group.partyCount === 0 ? (
              <DeleteGroupForm weddingId={weddingId} groupId={group.id} />
            ) : null}
          </li>
        ))}
      </ul>
      <form action={createAction} className="space-y-3">
        <input type="hidden" name="weddingId" value={weddingId} />
        <Field label="New group" htmlFor="group-name" error={createState?.fieldErrors?.name}>
          <input id="group-name" name="name" className={controlClassName} placeholder="College friends" />
        </Field>
        <FormMessage state={createState} />
        <SubmitButton pendingLabel="Adding...">Add group</SubmitButton>
      </form>
    </section>
  );
}

function DeleteGroupForm({ weddingId, groupId }: { weddingId: string; groupId: string }) {
  const [state, action] = useActionState(deleteGuestGroupAction, null);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="groupId" value={groupId} />
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove
      </SubmitButton>
      {state && !state.ok ? <span className="text-destructive text-xs">{state.message}</span> : null}
    </form>
  );
}
