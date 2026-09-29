"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeExperience } from "@/themes/experience";
import type { ThemeViewModel } from "@/themes/types";
import { cn } from "@/lib/utils";

export function PreviewShell({ model }: { model: ThemeViewModel }) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [surface, setSurface] = useState<"invitation" | "website">("invitation");
  const [opened, setOpened] = useState(false);
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-neutral-950 text-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-3">
        <Link href="/dashboard/theme" className="rounded-full px-3 py-1.5 text-sm hover:bg-white/10">
          Close
        </Link>
        <p className="text-sm text-white/70">{model.config.name} preview</p>
        <div className="ml-auto flex flex-wrap gap-1">
          <ChromeButton active={surface === "invitation"} onClick={() => setSurface("invitation")}>
            Invitation
          </ChromeButton>
          <ChromeButton
            active={surface === "website"}
            onClick={() => {
              setOpened(true);
              setSurface("website");
            }}
          >
            Website
          </ChromeButton>
          <ChromeButton active={device === "mobile"} onClick={() => setDevice("mobile")}>
            Mobile
          </ChromeButton>
          <ChromeButton active={device === "desktop"} onClick={() => setDevice("desktop")}>
            Desktop
          </ChromeButton>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 justify-center p-3 sm:p-6">
        <div
          className={cn(
            "h-full overflow-y-auto shadow-2xl",
            device === "mobile"
              ? "w-full max-w-[390px] rounded-[2rem] ring-1 ring-white/20"
              : "w-full max-w-5xl rounded-xl ring-1 ring-white/20",
          )}
        >
          <ThemeExperience
            model={model}
            surface={surface}
            opened={opened}
            onOpen={() => setOpened(true)}
            onEnter={() => {
              setOpened(true);
              setSurface("website");
            }}
            showMusicHint
          />
        </div>
      </div>
    </div>
  );
}

function ChromeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm",
        active ? "bg-white text-neutral-950" : "text-white/80 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
