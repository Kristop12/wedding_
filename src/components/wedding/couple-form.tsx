"use client";

import { useActionState, useState } from "react";
import { createWeddingAction, updateCoupleAction } from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";
import { slugify } from "@/lib/weddings/slug";

export function CoupleForm({
  weddingId,
  defaults,
  next,
  submitLabel,
}: {
  weddingId?: string;
  defaults: {
    partnerOneName: string;
    partnerTwoName: string;
    slug: string;
  };
  next?: string;
  submitLabel: string;
}) {
  const [state, action] = useActionState(
    weddingId ? updateCoupleAction : createWeddingAction,
    null,
  );
  const [partnerOneName, setPartnerOneName] = useState(defaults.partnerOneName);
  const [partnerTwoName, setPartnerTwoName] = useState(defaults.partnerTwoName);
  const [slug, setSlug] = useState(defaults.slug);

  return (
    <form action={action} className="bg-background ring-foreground/10 max-w-xl space-y-4 rounded-xl p-5 ring-1">
      {weddingId ? <input type="hidden" name="weddingId" value={weddingId} /> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Partner one" htmlFor="partnerOneName" error={state?.fieldErrors?.partnerOneName}>
        <input
          id="partnerOneName"
          name="partnerOneName"
          value={partnerOneName}
          onChange={(event) => setPartnerOneName(event.target.value)}
          className={controlClassName}
          required
          autoComplete="name"
        />
      </Field>
      <Field label="Partner two" htmlFor="partnerTwoName" error={state?.fieldErrors?.partnerTwoName}>
        <input
          id="partnerTwoName"
          name="partnerTwoName"
          value={partnerTwoName}
          onChange={(event) => setPartnerTwoName(event.target.value)}
          className={controlClassName}
          required
        />
      </Field>
      <Field label="Wedding link" htmlFor="slug" error={state?.fieldErrors?.slug}>
        <div className="flex gap-2">
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={controlClassName}
            required
            spellCheck={false}
          />
          <button
            type="button"
            className="text-sm underline-offset-4 hover:underline"
            onClick={() => setSlug(slugify(`${partnerOneName} and ${partnerTwoName}`))}
          >
            Suggest
          </button>
        </div>
        <p className="text-muted-foreground text-xs">Public address: /w/{slug || "your-names"}</p>
      </Field>
      <FormMessage state={state} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
