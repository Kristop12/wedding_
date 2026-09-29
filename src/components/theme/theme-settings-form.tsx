"use client";

import { useActionState } from "react";
import { updateThemeSettingsAction } from "@/app/dashboard/weddings/actions";
import { controlClassName, Field, FormMessage } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";
import { BODY_FONTS, ENVELOPE_STYLES, HEADING_FONTS, SCRIPT_FONTS } from "@/themes/options";

export function ThemeSettingsForm({
  weddingId,
  defaults,
}: {
  weddingId: string;
  defaults: {
    primaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    scriptFont: string;
    envelopeStyle: string;
    sealInitials: string;
    musicEnabled: boolean;
    musicUrl: string;
  };
}) {
  const [state, action] = useActionState(updateThemeSettingsAction, null);

  return (
    <form action={action} className="max-w-xl space-y-4">
      <input type="hidden" name="weddingId" value={weddingId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary color" htmlFor="primaryColor" error={state?.fieldErrors?.primaryColor}>
          <input
            id="primaryColor"
            name="primaryColor"
            type="color"
            defaultValue={defaults.primaryColor}
            className="border-input h-10 w-full cursor-pointer rounded-lg border bg-transparent p-1"
          />
        </Field>
        <Field label="Accent color" htmlFor="accentColor" error={state?.fieldErrors?.accentColor}>
          <input
            id="accentColor"
            name="accentColor"
            type="color"
            defaultValue={defaults.accentColor}
            className="border-input h-10 w-full cursor-pointer rounded-lg border bg-transparent p-1"
          />
        </Field>
        <FontSelect
          id="headingFont"
          label="Heading font"
          name="headingFont"
          value={defaults.headingFont}
          options={HEADING_FONTS}
          error={state?.fieldErrors?.headingFont}
        />
        <FontSelect
          id="bodyFont"
          label="Body font"
          name="bodyFont"
          value={defaults.bodyFont}
          options={BODY_FONTS}
          error={state?.fieldErrors?.bodyFont}
        />
        <FontSelect
          id="scriptFont"
          label="Script font"
          name="scriptFont"
          value={defaults.scriptFont}
          options={SCRIPT_FONTS}
          error={state?.fieldErrors?.scriptFont}
        />
        <Field label="Envelope style" htmlFor="envelopeStyle" error={state?.fieldErrors?.envelopeStyle}>
          <select
            id="envelopeStyle"
            name="envelopeStyle"
            defaultValue={defaults.envelopeStyle}
            className={controlClassName}
          >
            {ENVELOPE_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Wax seal initials" htmlFor="sealInitials" error={state?.fieldErrors?.sealInitials}>
        <input
          id="sealInitials"
          name="sealInitials"
          defaultValue={defaults.sealInitials}
          maxLength={8}
          className={controlClassName}
        />
      </Field>
      <Field label="Music link" htmlFor="musicUrl" error={state?.fieldErrors?.musicUrl}>
        <input
          id="musicUrl"
          name="musicUrl"
          type="url"
          defaultValue={defaults.musicUrl}
          placeholder="https://example.com/song.mp3"
          className={controlClassName}
        />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="musicEnabled"
          defaultChecked={defaults.musicEnabled}
          className="mt-1"
        />
        <span>Play music after the guest opens the invitation</span>
      </label>
      <p className="text-muted-foreground text-sm">
        Use an https link ending in .mp3 or .m4a. Music starts only after the guest taps the envelope.
      </p>
      <FormMessage state={state} />
      <SubmitButton>Save theme settings</SubmitButton>
    </form>
  );
}

function FontSelect({
  id,
  label,
  name,
  value,
  options,
  error,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <select id={id} name={name} defaultValue={value} className={controlClassName}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}
