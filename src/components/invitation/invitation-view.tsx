"use client";

import { useState } from "react";
import { RsvpForm, type InvitationReply } from "@/components/invitation/rsvp-form";
import { ThemeExperience } from "@/themes/experience";
import type { ThemeViewModel } from "@/themes/types";

export function InvitationView({
  model,
  reply,
}: {
  model: ThemeViewModel;
  reply: InvitationReply;
}) {
  const [surface, setSurface] = useState<"invitation" | "website">("invitation");
  const [opened, setOpened] = useState(false);
  const form = model.sections.includes("RSVP") ? <RsvpForm reply={reply} /> : null;

  return (
    <ThemeExperience
      model={model}
      surface={surface}
      opened={opened}
      onOpen={() => setOpened(true)}
      onEnter={() => {
        setOpened(true);
        setSurface("website");
      }}
      rsvpForm={form}
    />
  );
}
