"use client";

import { useActionState } from "react";
import {
  deleteGalleryItemAction,
  moveGalleryItemAction,
  saveGalleryItemAction,
} from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

type GalleryItem = { id: string; imageUrl: string; caption: string | null };

export function GalleryManager({ weddingId, items }: { weddingId: string; items: GalleryItem[] }) {
  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Photos on the wedding page. Use a path on this site or an https image link.
        </p>
      </div>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
            <GalleryForm
              weddingId={weddingId}
              galleryId={item.id}
              defaults={{ imageUrl: item.imageUrl, caption: item.caption ?? "" }}
              submitLabel="Save photo"
            />
            <div className="flex flex-wrap gap-2">
              {index > 0 ? (
                <form action={moveGalleryItemAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="galleryId" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Up
                  </SubmitButton>
                </form>
              ) : null}
              {index < items.length - 1 ? (
                <form action={moveGalleryItemAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="galleryId" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Down
                  </SubmitButton>
                </form>
              ) : null}
              <DeletePhoto weddingId={weddingId} galleryId={item.id} />
            </div>
          </li>
        ))}
      </ol>
      <div className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
        <h2 className="mb-3 font-medium">Add a photo</h2>
        <GalleryForm weddingId={weddingId} defaults={{ imageUrl: "", caption: "" }} submitLabel="Add photo" />
      </div>
    </section>
  );
}

function GalleryForm({
  weddingId,
  galleryId,
  defaults,
  submitLabel,
}: {
  weddingId: string;
  galleryId?: string;
  defaults: { imageUrl: string; caption: string };
  submitLabel: string;
}) {
  const [state, action] = useActionState(saveGalleryItemAction, null);
  const idPrefix = galleryId ?? "new-photo";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="weddingId" value={weddingId} />
      {galleryId ? <input type="hidden" name="galleryId" value={galleryId} /> : null}
      <Field label="Image URL" htmlFor={`${idPrefix}-image`} error={state?.fieldErrors?.imageUrl}>
        <input
          id={`${idPrefix}-image`}
          name="imageUrl"
          defaultValue={defaults.imageUrl}
          className={controlClassName}
          placeholder="/demo/gallery-1.svg"
        />
      </Field>
      <Field label="Caption" htmlFor={`${idPrefix}-caption`} error={state?.fieldErrors?.caption}>
        <input
          id={`${idPrefix}-caption`}
          name="caption"
          defaultValue={defaults.caption}
          className={controlClassName}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}

function DeletePhoto({ weddingId, galleryId }: { weddingId: string; galleryId: string }) {
  const [state, action] = useActionState(deleteGalleryItemAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="galleryId" value={galleryId} />
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove
      </SubmitButton>
      {state && !state.ok ? <span className="text-destructive ml-2 text-xs">{state.message}</span> : null}
    </form>
  );
}
