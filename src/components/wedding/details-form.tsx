"use client";

import { useActionState } from "react";
import { updateDetailsAction } from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";
import { DEFAULT_TIMEZONE, TIMEZONES } from "@/lib/weddings/constants";

export function DetailsForm({
  weddingId,
  defaults,
  next,
  submitLabel,
}: {
  weddingId: string;
  defaults: {
    weddingDate: string;
    timezone: string;
    location: string;
    description: string;
  };
  next?: string;
  submitLabel: string;
}) {
  const [state, action] = useActionState(updateDetailsAction, null);
  const zones = TIMEZONES.includes(defaults.timezone as (typeof TIMEZONES)[number])
    ? TIMEZONES
    : [defaults.timezone, ...TIMEZONES];

  return (
    <form action={action} className="bg-background ring-foreground/10 max-w-xl space-y-4 rounded-xl p-5 ring-1">
      <input type="hidden" name="weddingId" value={weddingId} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Wedding date" htmlFor="weddingDate" error={state?.fieldErrors?.weddingDate}>
        <input
          id="weddingDate"
          name="weddingDate"
          type="date"
          defaultValue={defaults.weddingDate}
          className={controlClassName}
          required
        />
      </Field>
      <Field label="Timezone" htmlFor="timezone" error={state?.fieldErrors?.timezone}>
        <select
          id="timezone"
          name="timezone"
          defaultValue={defaults.timezone || DEFAULT_TIMEZONE}
          className={controlClassName}
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Primary location" htmlFor="location" error={state?.fieldErrors?.location}>
        <input
          id="location"
          name="location"
          defaultValue={defaults.location}
          className={controlClassName}
          placeholder="Bawbawon Beach Resort, Misamis Occidental"
        />
      </Field>
      <Field label="Short description" htmlFor="description" error={state?.fieldErrors?.description}>
        <textarea
          id="description"
          name="description"
          defaultValue={defaults.description}
          rows={4}
          className={`${controlClassName} h-auto py-2`}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
