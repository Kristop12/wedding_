"use client";

import { ElegantInvitation } from "./elegant/invitation";
import { InvitationShell } from "./invitation-shell";
import { ModernInvitation } from "./modern/invitation";
import { RusticInvitation } from "./rustic/invitation";
import type { SiteTone } from "./rustic/site";
import { TropicalInvitation } from "./tropical/invitation";
import type { ThemeViewModel } from "./types";

const themes: Record<string, { tone: SiteTone; Invitation: typeof RusticInvitation }> = {
  rustic: { tone: "rustic", Invitation: RusticInvitation },
  elegant: { tone: "elegant", Invitation: ElegantInvitation },
  modern: { tone: "modern", Invitation: ModernInvitation },
  tropical: { tone: "tropical", Invitation: TropicalInvitation },
};

export function ThemeExperience({
  model,
  surface,
  opened,
  onOpen,
  onEnter,
  showMusicHint = false,
  rsvpForm = null,
}: {
  model: ThemeViewModel;
  surface: "invitation" | "website";
  opened: boolean;
  onOpen: () => void;
  onEnter: () => void;
  showMusicHint?: boolean;
  rsvpForm?: React.ReactNode;
}) {
  const theme = themes[model.config.id] ?? themes.rustic;

  return (
    <InvitationShell
      model={model}
      surface={surface}
      opened={opened}
      onOpen={onOpen}
      onEnter={onEnter}
      showMusicHint={showMusicHint}
      rsvpForm={rsvpForm}
      tone={theme.tone}
      Invitation={theme.Invitation}
    />
  );
}
