"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateThemeAction } from "@/app/dashboard/weddings/actions";
import { FormMessage } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";
import { WEDDING_THEMES } from "@/lib/weddings/constants";

export type ThemeSwatch = {
  background: string;
  primary: string;
  accent: string;
  text: string;
};

export function ThemePicker({
  weddingId,
  themeId,
  next,
  submitLabel,
  swatches,
}: {
  weddingId: string;
  themeId: string;
  next?: string;
  submitLabel: string;
  swatches?: Record<string, ThemeSwatch>;
}) {
  const [state, action] = useActionState(updateThemeAction, null);

  return (
    <form action={action} className="max-w-3xl space-y-4">
      <input type="hidden" name="weddingId" value={weddingId} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Wedding theme</legend>
        {WEDDING_THEMES.map((theme) => {
          const swatch = swatches?.[theme.id];
          return (
            <div
              key={theme.id}
              className="bg-background has-checked:ring-foreground ring-foreground/10 overflow-hidden rounded-xl ring-1 has-checked:ring-2"
            >
              {swatch ? (
                <span
                  aria-hidden="true"
                  className="flex h-16 items-end px-4 py-2"
                  style={{ backgroundColor: swatch.background, color: swatch.text }}
                >
                  <span className="text-lg" style={{ color: swatch.primary }}>
                    Aa
                  </span>
                  <span className="ml-2 size-3 rounded-full" style={{ backgroundColor: swatch.accent }} />
                </span>
              ) : null}
              <div className="p-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="themeId"
                    value={theme.id}
                    defaultChecked={theme.id === themeId}
                  />
                  <span className="font-medium">{theme.name}</span>
                </label>
                <span className="text-muted-foreground mt-2 block text-sm">{theme.description}</span>
                <Link
                  href={`/dashboard/theme/preview?theme=${theme.id}`}
                  className="mt-3 inline-block text-sm underline"
                >
                  Preview
                </Link>
              </div>
            </div>
          );
        })}
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
