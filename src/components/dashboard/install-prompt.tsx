"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "wedding-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onPrompt(event: Event) {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") {
        return;
      }
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return;
      }
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!promptEvent) {
    return null;
  }

  return (
    <div className="bg-background flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-8">
      <p className="text-sm">Install the dashboard on this device.</p>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            void promptEvent.prompt().then(async () => {
              await promptEvent.userChoice;
              setPromptEvent(null);
            });
          }}
        >
          Install
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setPromptEvent(null);
          }}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
