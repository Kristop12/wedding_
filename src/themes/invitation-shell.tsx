"use client";

import { useRef, useState } from "react";
import { ThemeFrame } from "./theme-frame";
import { WeddingSite, type SiteTone } from "./rustic/site";
import type { ThemeViewModel } from "./types";

export type InvitationProps = {
  model: ThemeViewModel;
  opened: boolean;
  onOpen: () => void;
  onEnter: () => void;
};

export function InvitationShell({
  model,
  surface,
  opened,
  onOpen,
  onEnter,
  showMusicHint = false,
  rsvpForm = null,
  tone,
  Invitation,
}: {
  model: ThemeViewModel;
  surface: "invitation" | "website";
  opened: boolean;
  onOpen: () => void;
  onEnter: () => void;
  showMusicHint?: boolean;
  rsvpForm?: React.ReactNode;
  tone: SiteTone;
  Invitation: (props: InvitationProps) => React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  function openInvitation() {
    onOpen();
    const audio = audioRef.current;
    if (!audio || !model.musicUrl) {
      return;
    }
    audio.muted = muted;
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const next = !muted;
    audio.muted = next;
    setMuted(next);
    if (!next && !playing) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  return (
    <ThemeFrame model={model} className="relative min-h-full">
      {model.musicUrl ? <audio ref={audioRef} src={model.musicUrl} loop preload="none" /> : null}
      {surface === "website" ? (
        <WeddingSite model={model} rsvpForm={rsvpForm} tone={tone} />
      ) : (
        <Invitation model={model} opened={opened} onOpen={openInvitation} onEnter={onEnter} />
      )}
      {showMusicHint && model.musicEnabled && !model.musicUrl ? (
        <p className="px-6 pb-8 text-center text-xs tracking-[0.14em] uppercase opacity-70">
          Music is on. Add an mp3 or m4a link before guests will hear it.
        </p>
      ) : null}
      {opened && model.musicUrl ? (
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className="fixed right-4 bottom-20 z-20 rounded-full bg-[var(--theme-surface)] px-4 py-2 text-xs tracking-[0.14em] uppercase text-[var(--theme-text)] shadow-md md:bottom-4"
        >
          {muted || !playing ? "Unmute" : "Mute"}
        </button>
      ) : null}
    </ThemeFrame>
  );
}
