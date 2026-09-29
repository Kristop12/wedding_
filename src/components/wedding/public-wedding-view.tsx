"use client";

import { ThemeExperience } from "@/themes/experience";
import type { ThemeViewModel } from "@/themes/types";

export function PublicWeddingView({ model }: { model: ThemeViewModel }) {
  return (
    <ThemeExperience
      model={model}
      surface="website"
      opened
      onOpen={() => undefined}
      onEnter={() => undefined}
    />
  );
}
