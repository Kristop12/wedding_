"use client";

import { useActionState } from "react";
import { publishWeddingAction, unpublishWeddingAction } from "@/app/dashboard/weddings/actions";
import { CopyLinkButton } from "@/components/wedding/copy-link-button";
import { FormMessage } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

export function PublishPanel({
  weddingId,
  status,
  publicUrl,
  hasDate,
  eventCount,
  partyCount,
  parties,
}: {
  weddingId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publicUrl: string;
  hasDate: boolean;
  eventCount: number;
  partyCount: number;
  parties: { name: string; url: string }[];
}) {
  const [publishState, publishAction] = useActionState(publishWeddingAction, null);
  const [unpublishState, unpublishAction] = useActionState(unpublishWeddingAction, null);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-background ring-foreground/10 space-y-3 rounded-xl p-5 ring-1">
        <h2 className="font-medium">Ready to publish</h2>
        <ul className="space-y-1 text-sm">
          <li>{hasDate ? "Wedding date is set." : "Add a wedding date before publishing."}</li>
          <li>
            {eventCount} event{eventCount === 1 ? "" : "s"}.
          </li>
          <li>
            {partyCount} guest part{partyCount === 1 ? "y" : "ies"}.
          </li>
        </ul>
        <p className="text-sm">
          Status: <span className="font-medium">{status === "PUBLISHED" ? "Published" : "Draft"}</span>
        </p>
        <div className="space-y-2">
          <p className="text-sm font-medium">Public page</p>
          <CopyLinkButton value={publicUrl} label="Copy public link" />
          <p className="text-muted-foreground text-xs">
            The public page does not include gift details. Those stay on each guest&apos;s invitation.
          </p>
        </div>
        {status === "PUBLISHED" ? (
          <form action={unpublishAction}>
            <input type="hidden" name="weddingId" value={weddingId} />
            <FormMessage state={unpublishState} />
            <SubmitButton variant="outline" pendingLabel="Updating...">
              Unpublish
            </SubmitButton>
          </form>
        ) : (
          <form action={publishAction}>
            <input type="hidden" name="weddingId" value={weddingId} />
            <FormMessage state={publishState} />
            <SubmitButton pendingLabel="Publishing...">Publish wedding</SubmitButton>
          </form>
        )}
      </div>

      <div className="bg-background ring-foreground/10 space-y-3 rounded-xl p-5 ring-1">
        <h2 className="font-medium">Invitation links</h2>
        {parties.length === 0 ? (
          <p className="text-muted-foreground text-sm">Add a guest party to create an invitation link.</p>
        ) : (
          parties.map((party) => (
            <div key={party.url} className="space-y-1">
              <p className="text-sm">{party.name}</p>
              <CopyLinkButton value={party.url} label="Copy invitation link" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
