"use client";

import { useActionState } from "react";
import {
  deleteDressCodeImageAction,
  moveDressCodeImageAction,
  saveDressCodeImageAction,
  updateDressCodeCaptionAction,
  type DressCodeActionState,
} from "@/app/dashboard/dress-code/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

type DressCodeImageItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function DressCodeImageManager({
  weddingId,
  items,
}: {
  weddingId: string;
  items: DressCodeImageItem[];
}) {
  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dress code images</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Shown on the Dress Code section of the invitation and public page. Up to 6 images.
        </p>
      </div>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.caption ?? "Dress code reference"}
              className="max-h-48 w-full rounded-lg object-cover"
            />
            <CaptionForm weddingId={weddingId} imageId={item.id} caption={item.caption ?? ""} />
            <div className="flex flex-wrap gap-2">
              {index > 0 ? (
                <form action={moveDressCodeImageAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="imageId" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Up
                  </SubmitButton>
                </form>
              ) : null}
              {index < items.length - 1 ? (
                <form action={moveDressCodeImageAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="imageId" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Down
                  </SubmitButton>
                </form>
              ) : null}
              <DeleteImage weddingId={weddingId} imageId={item.id} />
            </div>
          </li>
        ))}
      </ol>
      {items.length < 6 ? (
        <div className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
          <h3 className="mb-3 font-medium">Add an image</h3>
          <AddImageForm weddingId={weddingId} />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">You have reached the 6-image limit.</p>
      )}
    </section>
  );
}

function AddImageForm({ weddingId }: { weddingId: string }) {
  const [state, action] = useActionState(saveDressCodeImageAction, null as DressCodeActionState);

  return (
    <form action={action} className="space-y-3" encType="multipart/form-data">
      <input type="hidden" name="weddingId" value={weddingId} />
      <Field label="Image" htmlFor="dress-image" error={state?.fieldErrors?.image}>
        <input
          id="dress-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={controlClassName}
          required
        />
      </Field>
      <Field label="Caption" htmlFor="dress-caption" error={state?.fieldErrors?.caption}>
        <input id="dress-caption" name="caption" className={controlClassName} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Uploading...">Add image</SubmitButton>
    </form>
  );
}

function CaptionForm({
  weddingId,
  imageId,
  caption,
}: {
  weddingId: string;
  imageId: string;
  caption: string;
}) {
  const [state, action] = useActionState(updateDressCodeCaptionAction, null as DressCodeActionState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="imageId" value={imageId} />
      <Field label="Caption" htmlFor={`dress-caption-${imageId}`} error={state?.fieldErrors?.caption}>
        <input
          id={`dress-caption-${imageId}`}
          name="caption"
          defaultValue={caption}
          className={controlClassName}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton variant="outline" pendingLabel="Saving...">
        Save caption
      </SubmitButton>
    </form>
  );
}

function DeleteImage({ weddingId, imageId }: { weddingId: string; imageId: string }) {
  const [state, action] = useActionState(deleteDressCodeImageAction, null as DressCodeActionState);
  return (
    <form action={action}>
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="imageId" value={imageId} />
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove
      </SubmitButton>
      {state && !state.ok ? <span className="text-destructive ml-2 text-xs">{state.message}</span> : null}
    </form>
  );
}
