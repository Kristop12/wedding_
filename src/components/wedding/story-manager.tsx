"use client";

import { useActionState } from "react";
import {
  deleteStoryItemAction,
  moveStoryItemAction,
  saveStoryItemAction,
} from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

type StoryItem = {
  id: string;
  title: string;
  date: string | null;
  description: string | null;
  imageUrl: string | null;
};

export function StoryManager({ weddingId, items }: { weddingId: string; items: StoryItem[] }) {
  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-medium">Our story</h2>
        <p className="text-muted-foreground text-sm">Moments guests see on the wedding page.</p>
      </div>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
            <StoryForm
              weddingId={weddingId}
              storyId={item.id}
              defaults={{
                title: item.title,
                date: item.date ?? "",
                description: item.description ?? "",
                imageUrl: item.imageUrl ?? "",
              }}
              submitLabel="Save story"
            />
            <div className="flex flex-wrap gap-2">
              {index > 0 ? (
                <form action={moveStoryItemAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="storyId" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Up
                  </SubmitButton>
                </form>
              ) : null}
              {index < items.length - 1 ? (
                <form action={moveStoryItemAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="storyId" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Down
                  </SubmitButton>
                </form>
              ) : null}
              <DeleteStory weddingId={weddingId} storyId={item.id} />
            </div>
          </li>
        ))}
      </ol>
      <div className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
        <h3 className="mb-3 font-medium">Add a moment</h3>
        <StoryForm
          weddingId={weddingId}
          defaults={{ title: "", date: "", description: "", imageUrl: "" }}
          submitLabel="Add story"
        />
      </div>
    </section>
  );
}

function StoryForm({
  weddingId,
  storyId,
  defaults,
  submitLabel,
}: {
  weddingId: string;
  storyId?: string;
  defaults: { title: string; date: string; description: string; imageUrl: string };
  submitLabel: string;
}) {
  const [state, action] = useActionState(saveStoryItemAction, null);
  const idPrefix = storyId ?? "new-story";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="weddingId" value={weddingId} />
      {storyId ? <input type="hidden" name="storyId" value={storyId} /> : null}
      <Field label="Title" htmlFor={`${idPrefix}-title`} error={state?.fieldErrors?.title}>
        <input id={`${idPrefix}-title`} name="title" defaultValue={defaults.title} className={controlClassName} />
      </Field>
      <Field label="Date" htmlFor={`${idPrefix}-date`} error={state?.fieldErrors?.date}>
        <input id={`${idPrefix}-date`} name="date" defaultValue={defaults.date} className={controlClassName} placeholder="2019" />
      </Field>
      <Field label="Description" htmlFor={`${idPrefix}-description`} error={state?.fieldErrors?.description}>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={defaults.description}
          rows={3}
          className={`${controlClassName} h-auto py-2`}
        />
      </Field>
      <Field label="Image URL" htmlFor={`${idPrefix}-image`} error={state?.fieldErrors?.imageUrl}>
        <input
          id={`${idPrefix}-image`}
          name="imageUrl"
          defaultValue={defaults.imageUrl}
          className={controlClassName}
          placeholder="/photos/story.jpg or https://"
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}

function DeleteStory({ weddingId, storyId }: { weddingId: string; storyId: string }) {
  const [state, action] = useActionState(deleteStoryItemAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="storyId" value={storyId} />
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove
      </SubmitButton>
      {state && !state.ok ? <span className="text-destructive ml-2 text-xs">{state.message}</span> : null}
    </form>
  );
}
